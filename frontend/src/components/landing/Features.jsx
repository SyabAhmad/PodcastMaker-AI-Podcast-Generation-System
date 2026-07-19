import { Wand2, Users, Mic, Zap, Globe, Shield } from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'Topic to Episode',
    description: 'Just describe your topic and the AI generates a full podcast script with natural dialogue.',
  },
  {
    icon: Users,
    title: 'Multi-Speaker',
    description: 'Automatic host-guest dynamics with distinct AI voices for each speaker.',
  },
  {
    icon: Mic,
    title: 'Realistic Voices',
    description: 'High-quality text-to-speech with Coqui XTTS. Natural pacing, intonation, and emotion.',
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Groq-powered LLM generates scripts in seconds. No waiting around.',
  },
  {
    icon: Globe,
    title: 'Multiple Languages',
    description: 'Generate podcasts in English, Spanish, French, and more with language-aware voices.',
  },
  {
    icon: Shield,
    title: 'Full Control',
    description: 'Edit scripts before generating audio. Choose styles, durations, and speaker counts.',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-surface/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything you need to podcast
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            From idea to audio in minutes. No recording equipment, no editing skills required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 bg-white rounded-2xl border border-border hover:border-accent/20 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
