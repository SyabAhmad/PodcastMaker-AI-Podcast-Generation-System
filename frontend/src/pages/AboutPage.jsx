import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Heart } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Simplicity',
    description: 'Podcasting should be about ideas, not technical setup. We handle the hard parts so you can focus on what matters.',
  },
  {
    icon: Users,
    title: 'Accessibility',
    description: 'Anyone should be able to create a podcast. No expensive equipment, no editing skills, no studio needed.',
  },
  {
    icon: Heart,
    title: 'Quality',
    description: 'AI-generated doesn\'t mean robotic. We use state-of-the-art models to produce natural, engaging audio.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Podcasting for everyone
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            We believe everyone has a story worth telling. PodcastMaker removes the barriers 
            between your ideas and a finished podcast episode.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <div className="prose prose-lg text-muted">
            <p>
              Traditional podcasting requires microphones, soundproofing, editing software, 
              and hours of production time. We thought: what if AI could handle all of that?
            </p>
            <p>
              PodcastMaker combines large language models for scriptwriting with neural 
              text-to-speech for audio generation. Give us a topic, and we'll create a 
              complete podcast episode with natural-sounding voices, proper pacing, and 
              engaging dialogue.
            </p>
            <p>
              Whether you're a solo creator exploring ideas, a team producing internal 
              content, or anyone in between — we make it possible to go from concept to 
              published episode in minutes.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">What we believe</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 bg-surface rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-20 p-8 bg-surface rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Built with</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">G</div>
              <div>
                <p className="font-medium text-ink">Groq LLM</p>
                <p className="text-xs">Ultra-fast script generation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">XT</div>
              <div>
                <p className="font-medium text-ink">Coqui XTTS</p>
                <p className="text-xs">Open-source neural voices</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">FA</div>
              <div>
                <p className="font-medium text-ink">FastAPI</p>
                <p className="text-xs">High-performance Python API</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">N</div>
              <div>
                <p className="font-medium text-ink">Next.js</p>
                <p className="text-xs">Modern React frontend</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to create?</h2>
          <p className="text-muted mb-6">Start making your first podcast in under a minute.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
