import Pricing from '../components/landing/Pricing';
import CTA from '../components/landing/CTA';

export default function PricingPage() {
  return (
    <div className="pt-28">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Pricing</h1>
        <p className="text-lg text-muted max-w-lg mx-auto">
          Start free. Upgrade when you need more.
        </p>
      </div>
      <Pricing />
      <CTA />
    </div>
  );
}
