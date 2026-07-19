import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered podcast creation
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-ink mb-6 leading-[1.1]">
          Your ideas,{' '}
          <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            their voices
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Give us a topic. We'll generate a full podcast episode with natural-sounding AI voices, 
          complete with scripts, multiple speakers, and professional audio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25"
          >
            Start creating — it's free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-2 px-6 py-3 text-muted hover:text-ink font-medium rounded-xl transition-colors"
          >
            <Play className="w-4 h-4" />
            See how it works
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted/60">
          <span>Powered by Groq LLM</span>
          <span className="w-1 h-1 rounded-full bg-muted/30" />
          <span>Coqui XTTS voices</span>
          <span className="w-1 h-1 rounded-full bg-muted/30" />
          <span>Open source</span>
        </div>
      </div>
    </section>
  );
}
