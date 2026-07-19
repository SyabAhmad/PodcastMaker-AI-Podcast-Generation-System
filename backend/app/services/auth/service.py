from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import create_access_token, create_refresh_token, decode_token
from ...core.settings import settings
from ...models.user import RefreshToken, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, email: str, username: str, password: str) -> User:
        # Check existing
        existing = await self.db.execute(select(User).where((User.email == email) | (User.username == username)))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username already exists")

        user = User(email=email, username=username, hashed_password=pwd_context.hash(password))
        self.db.add(user)
        await self.db.flush()
        return user

    async def login(self, email: str, password: str) -> dict:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not pwd_context.verify(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

        return await self._issue_tokens(user)

    async def refresh(self, token: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token == token,
                not RefreshToken.is_revoked,
                RefreshToken.expires_at > datetime.now(UTC),
            )
        )
        db_token = result.scalar_one_or_none()
        if not db_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked")

        # Revoke old token
        db_token.is_revoked = True

        # Get user
        user = await self.db.get(User, payload["sub"])
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return await self._issue_tokens(user)

    async def logout(self, refresh_token: str) -> None:
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token))
        db_token = result.scalar_one_or_none()
        if db_token:
            db_token.is_revoked = True

    async def get_current_user(self, user_id: str) -> User:
        user = await self.db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def _issue_tokens(self, user: User) -> dict:
        access = create_access_token({"sub": str(user.id), "email": user.email})
        refresh = create_refresh_token({"sub": str(user.id)})

        # Store refresh token
        db_token = RefreshToken(
            token=refresh,
            user_id=user.id,
            expires_at=datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self.db.add(db_token)

        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
        }
