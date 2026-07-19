import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const styles = [
  { value: 'conversational', label: 'Conversational', desc: 'Natural back-and-forth dialogue' },
  { value: 'formal', label: 'Formal', desc: 'Professional and structured' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Narrative-driven with drama' },
];

export default function NewPodcastPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('topic'); // 'topic' or 'custom'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Full generation mode
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [numEpisodes, setNumEpisodes] = useState(1);
  const [duration, setDuration] = useState(10);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [style, setStyle] = useState('conversational');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'topic') {
        const podcast = await api.generateFull({
          title: title || topic,
          topic,
          description: description || undefined,
          num_episodes: numEpisodes,
          duration_minutes: duration,
          num_speakers: numSpeakers,
          style,
        });
        navigate(`/podcasts/${podcast.id}`);
      } else {
        const podcast = await api.createPodcast({
          title: title || 'Untitled Podcast',
          topic: topic || undefined,
          description: description || undefined,
        });
        navigate(`/podcasts/${podcast.id}`);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-1">Create a Podcast</h1>
      <p className="text-muted mb-8">Give it a topic and the AI will generate everything</p>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-error/10 text-error rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setMode('topic')}
          className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'topic'
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-muted/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm">Full Generation</span>
          </div>
          <p className="text-xs text-muted">AI generates script + audio from your topic</p>
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'custom'
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-muted/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Custom Setup</span>
          </div>
          <p className="text-xs text-muted">Create the podcast, add scripts manually later</p>
        </button>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
            placeholder="e.g. Tech Talk Weekly"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Topic *</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
            placeholder="e.g. The future of autonomous vehicles and how they'll reshape cities"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
            placeholder="A brief description of your podcast"
          />
        </div>

        {mode === 'topic' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Episodes</label>
                <select
                  value={numEpisodes}
                  onChange={(e) => setNumEpisodes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                >
                  {[1, 2, 3, 5, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Duration (min)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                >
                  {[5, 10, 15, 20, 30].map((n) => (
                    <option key={n} value={n}>{n} min</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Speakers</label>
                <select
                  value={numSpeakers}
                  onChange={(e) => setNumSpeakers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <div className="grid grid-cols-3 gap-3">
                {styles.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStyle(s.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      style === s.value
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-muted/30'
                    }`}
                  >
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating your podcast...
            </>
          ) : mode === 'topic' ? (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Podcast
            </>
          ) : (
            'Create Podcast'
          )}
        </button>

        {mode === 'topic' && loading && (
          <p className="text-center text-sm text-muted">
            This may take a few minutes. The AI is generating scripts and audio...
          </p>
        )}
      </form>
    </div>
  );
}
