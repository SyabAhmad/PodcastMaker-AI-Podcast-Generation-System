export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted mb-10">Last updated: July 19, 2026</p>

        <div className="prose prose-lg text-muted space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. Information We Collect</h2>
            <p>
              When you create an account, we collect your email address and username. 
              We also store the podcasts, scripts, and audio files you generate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve the PodcastMaker service, 
              including generating podcast content using AI models. We do not sell your 
              personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. Data Storage</h2>
            <p>
              Your data is stored securely on our servers. Generated audio files and 
              scripts are retained until you delete them. Account data is retained 
              until you delete your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. AI Processing</h2>
            <p>
              Your podcast topics and scripts are sent to third-party AI providers 
              (Groq for text generation, Coqui for voice synthesis) to generate content. 
              These providers process data according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. 
              We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. Contact</h2>
            <p>
              For privacy-related questions, contact us at privacy@podcastmaker.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
