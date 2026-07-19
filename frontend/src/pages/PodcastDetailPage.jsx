import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  ArrowLeft,
  Podcast,
  Play,
  FileText,
  Mic,
  Loader2,
  Clock,
  Sparkles,
  Volume2,
  AlertCircle,
} from 'lucide-react';

const statusConfig = {
  draft: { color: 'bg-muted/10 text-muted', icon: FileText, label: 'Draft' },
  scripted: { color: 'bg-accent/10 text-accent', icon: FileText, label: 'Scripted' },
  generating_audio: { color: 'bg-warning/10 text-warning', icon: Loader2, label: 'Generating Audio', spin: true },
  completed: { color: 'bg-success/10 text-success', icon: Play, label: 'Ready' },
  failed: { color: 'bg-error/10 text-error', icon: AlertCircle, label: 'Failed' },
};

export default function PodcastDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPodcast(id).then(setPodcast).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
  }, [id]);

  // Poll for status updates when generating
  useEffect(() => {
    if (!podcast || podcast.status !== 'generating') return;
    const interval = setInterval(async () => {
      const updated = await api.getPodcast(id);
      setPodcast(updated);
      if (updated.status !== 'generating') clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [podcast?.status, id]);

  const handleGenerateScript = async (episodeId) => {
    setGenerating(episodeId);
    setError('');
    try {
      await api.generateScript({
        topic: podcast.topic || podcast.title,
        episode_title: podcast.title,
        episode_id: episodeId,
      });
      const updated = await api.getPodcast(id);
      setPodcast(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAudio = async (episodeId) => {
    setGenerating(episodeId);
    setError('');
    try {
      await api.generateAudio({ episode_id: episodeId });
      const updated = await api.getPodcast(id);
      setPodcast(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!podcast) return null;

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-muted hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shrink-0">
          <Podcast className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{podcast.title}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${podcast.status === 'generating' ? 'bg-warning/10 text-warning' : podcast.status === 'ready' ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
              {podcast.status}
            </span>
          </div>
          {podcast.description && <p className="text-muted">{podcast.description}</p>}
          {podcast.topic && (
            <p className="text-sm text-muted/70 mt-1">Topic: {podcast.topic}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-error/10 text-error rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {podcast.status === 'generating' && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-accent/5 border border-accent/20 rounded-xl">
          <div className="relative">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring" />
          </div>
          <div>
            <p className="text-sm font-medium">Generating your podcast...</p>
            <p className="text-xs text-muted">Scripts and audio are being created. This may take a few minutes.</p>
          </div>
        </div>
      )}

      {/* Episodes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Episodes ({podcast.episodes?.length || 0})
        </h2>
      </div>

      {!podcast.episodes?.length ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <Mic className="w-10 h-10 text-muted/30 mx-auto mb-3" />
          <p className="text-muted">No episodes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {podcast.episodes
            .sort((a, b) => a.episode_number - b.episode_number)
            .map((episode) => {
              const st = statusConfig[episode.status] || statusConfig.draft;
              const StIcon = st.icon;
              return (
                <div
                  key={episode.id}
                  className="p-5 bg-white border border-border rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-sm font-bold text-muted shrink-0">
                      {episode.episode_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold truncate">{episode.title}</h3>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                          <StIcon className={`w-3 h-3 ${st.spin ? 'animate-spin' : ''}`} />
                          {st.label}
                        </span>
                      </div>
                      {episode.duration_seconds && (
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(episode.duration_seconds / 60)} min
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {episode.status === 'draft' && (
                        <button
                          onClick={() => handleGenerateScript(episode.id)}
                          disabled={generating === episode.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {generating === episode.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          Generate Script
                        </button>
                      )}

                      {episode.status === 'scripted' && (
                        <button
                          onClick={() => handleGenerateAudio(episode.id)}
                          disabled={generating === episode.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50"
                        >
                          {generating === episode.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          Generate Audio
                        </button>
                      )}

                      {episode.status === 'failed' && (
                        <button
                          onClick={() => handleGenerateAudio(episode.id)}
                          disabled={generating === episode.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {generating === episode.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          Retry Audio
                        </button>
                      )}

                      {episode.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          {episode.audio_file_path && (
                            <audio controls className="h-8">
                              <source src={`/api/v1/files/${episode.audio_file_path.split(/[/\\]/).pop()}`} />
                            </audio>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {episode.script && (
                    <details className="mt-3">
                      <summary className="text-xs text-muted cursor-pointer hover:text-ink transition-colors">
                        View script
                      </summary>
                      <div className="mt-2 p-3 bg-surface rounded-lg text-sm text-muted whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {episode.script}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
