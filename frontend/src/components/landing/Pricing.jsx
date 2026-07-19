import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for trying out AI podcasting',
    features: [
      '3 podcasts per month',
      '5-minute episodes',
      '2 speakers max',
      'Basic voice quality',
      'Community support',
    ],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For regular podcast creators',
    features: [
      'Unlimited podcasts',
      '30-minute episodes',
      '4 speakers max',
      'Premium voice quality',
      'Script editing',
      'Priority generation',
      'Email support',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$49',
    period: '/month',
    description: 'For teams and professional creators',
    features: [
      'Everything in Pro',
      '60-minute episodes',
      'Unlimited speakers',
      'Custom voice cloning',
      'API access',
      'White-label exports',
      'Dedicated support',
      'Team collaboration',
    ],
    cta: 'Contact sales',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(({ name, price, period, description, features, cta, highlight }) => (
            <div
              key={name}
              className={`relative p-8 rounded-2xl border-2 transition-all ${
                highlight
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-white hover:border-muted/30'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                  Most popular
                </div>
              )}

              <h3 className="text-lg font-semibold mb-1">{name}</h3>
              <p className="text-sm text-muted mb-6">{description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{price}</span>
                {period && <span className="text-muted text-sm">{period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  highlight
                    ? 'bg-accent hover:bg-accent-hover text-white'
                    : 'bg-surface hover:bg-surface-hover text-ink'
                }`}
              >
                {cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
