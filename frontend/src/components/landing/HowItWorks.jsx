import { MessageSquare, Wand2, Headphones } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Describe your topic',
    description: 'Tell us what your podcast episode should be about. Choose the number of speakers and style.',
  },
  {
    icon: Wand2,
    step: '02',
    title: 'AI generates the script',
    description: 'Groq LLM creates a natural, engaging script with host-guest dialogue in seconds.',
  },
  {
    icon: Headphones,
    step: '03',
    title: 'Get your audio',
    description: 'Coqui XTTS turns the script into realistic audio with distinct voices for each speaker.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-surface/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Three steps from idea to finished podcast episode.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <div key={step} className="text-center">
              <div className="relative inline-flex mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
