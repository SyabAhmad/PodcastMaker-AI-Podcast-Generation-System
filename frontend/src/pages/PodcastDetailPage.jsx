import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  ArrowLeft,
  Podcast,
  Play,
  Pause,
  FileText,
  Mic,
  Loader2,
  Clock,
  Sparkles,
  Volume2,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const statusConfig = {
  draft: { color: 'bg-muted/10 text-muted', icon: FileText, label: 'Draft' },
  scripted: { color: 'bg-accent/10 text-accent', icon: FileText, label: 'Scripted' },
  generating_audio: { color: 'bg-warning/10 text-warning', icon: Loader2, label: 'Generating', spin: true },
  completed: { color: 'bg-success/10 text-success', icon: Play, label: 'Ready' },
  failed: { color: 'bg-error/10 text-error', icon: AlertCircle, label: 'Failed' },
};

const speakerColors = [
  { bg: 'bg-blue-500', name: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
  { bg: 'bg-purple-500', name: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200' },
  { bg: 'bg-emerald-500', name: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200' },
  { bg: 'bg-orange-500', name: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' },
  { bg: 'bg-rose-500', name: 'text-rose-700', light: 'bg-rose-50', border: 'border-rose-200' },
];

function parseScript(scriptStr) {
  try {
    return JSON.parse(scriptStr.replace(/'/g, '"'));
  } catch {
    try {
      return new Function('return ' + scriptStr)();
    } catch {
      return null;
    }
  }
}

function SpeakerAvatar({ name, index }) {
  const color = speakerColors[index % speakerColors.length];
  return (
    <div className={`w-8 h-8 ${color.bg} rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function TranscriptView({ script }) {
  const data = parseScript(script);
  if (!data) return <p className="text-sm text-muted p-4">Could not parse script</p>;

  const speakers = data.speakers || [];
  const segments = data.segments || [];

  return (
    <div className="space-y-1 py-3">
      {data.intro && (
        <div className="px-5 py-3 bg-accent/5 border-l-2 border-accent rounded-r-lg mx-4 mb-3">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1">Intro</p>
          <p className="text-sm text-ink leading-relaxed">{data.intro}</p>
        </div>
      )}

      {segments.map((seg, i) => {
        const speakerIdx = speakers.findIndex((s) => s.name === seg.speaker);
        const color = speakerColors[speakerIdx >= 0 ? speakerIdx : i % speakerColors.length];
        const speaker = speakers[speakerIdx] || { name: seg.speaker, role: 'speaker' };

        return (
          <div key={i} className="flex gap-3 px-5 py-2 hover:bg-surface/50 transition-colors rounded-lg mx-2">
            <SpeakerAvatar name={speaker.name} index={speakerIdx >= 0 ? speakerIdx : i} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-sm font-semibold ${color.name}`}>{speaker.name}</span>
                <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded-full capitalize">{speaker.role}</span>
              </div>
              <p className="text-sm text-ink leading-relaxed">{seg.text}</p>
            </div>
          </div>
        );
      })}

      {data.outro && (
        <div className="px-5 py-3 bg-purple-50 border-l-2 border-purple-400 rounded-r-lg mx-4 mt-3">
          <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider mb-1">Outro</p>
          <p className="text-sm text-ink leading-relaxed">{data.outro}</p>
        </div>
      )}
    </div>
  );
}

function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface/50 rounded-xl p-4 mx-5 mb-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex items-center gap-3">
        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors shrink-0">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="relative h-1.5 bg-border rounded-full overflow-hidden cursor-pointer group"
            onClick={(e) => {
              if (!audioRef.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
            }}
          >
            <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted">{formatTime(progress)}</span>
            <span className="text-[10px] text-muted">{formatTime(duration)}</span>
          </div>
        </div>

        <a href={audioUrl} download className="p-1.5 text-muted hover:text-ink hover:bg-white rounded-lg transition-colors" title="Download">
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function EpisodeCard({ episode, onGenerateScript, onGenerateAudio, generating, voices }) {
  const [expanded, setExpanded] = useState(episode.status !== 'draft');
  const [tab, setTab] = useState('transcript');
  const [selectedVoice, setSelectedVoice] = useState('');

  const st = statusConfig[episode.status] || statusConfig.draft;
  const StIcon = st.icon;
  const hasScript = !!episode.script;
  const hasAudio = !!episode.audio_file_path;

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {/* Episode header — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-surface/30 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-sm font-bold text-muted shrink-0">
          {episode.episode_number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="font-semibold text-sm truncate">{episode.title}</h3>
            <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${st.color}`}>
              <StIcon className={`w-3 h-3 ${st.spin ? 'animate-spin' : ''}`} />
              {st.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {episode.status === 'draft' && (
            <button
              onClick={() => onGenerateScript(episode.id)}
              disabled={generating === episode.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {generating === episode.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Script
            </button>
          )}

          {(episode.status === 'scripted' || (episode.status === 'failed' && hasScript)) && (
            <div className="flex items-center gap-1.5">
              {voices.length > 0 && (
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="text-[10px] px-2 py-1.5 border border-border rounded-lg bg-white text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">Default voice</option>
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => onGenerateAudio(episode.id, selectedVoice || undefined)}
                disabled={generating === episode.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50"
              >
                {generating === episode.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                {episode.status === 'failed' ? 'Retry' : 'Audio'}
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 text-muted">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Audio player */}
          {hasAudio && (
            <div className="pt-3">
              <AudioPlayer audioUrl={`/api/v1/files/${episode.audio_file_path.split(/[/\\]/).pop()}`} />
            </div>
          )}

          {/* Transcript */}
          {hasScript && (
            <div>
              <div className="flex gap-1 px-5 border-t border-border">
                <button
                  onClick={() => setTab('transcript')}
                  className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                    tab === 'transcript' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setTab('raw')}
                  className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                    tab === 'raw' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  Raw Script
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {tab === 'transcript' ? (
                  <TranscriptView script={episode.script} />
                ) : (
                  <pre className="p-5 text-xs text-muted whitespace-pre-wrap font-mono leading-relaxed">
                    {episode.script}
                  </pre>
                )}
              </div>
            </div>
          )}

          {!hasScript && (
            <div className="py-8 text-center text-sm text-muted">
              Click "Script" to generate a script for this episode.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PodcastDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState('');
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    api.getPodcast(id).then(setPodcast).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
    api.getVoices().then((d) => setVoices(d.voices || [])).catch(() => {});
  }, [id]);

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
      setPodcast(await api.getPodcast(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAudio = async (episodeId, voice) => {
    setGenerating(episodeId);
    setError('');
    try {
      await api.generateAudio({ episode_id: episodeId, voice: voice || null });
      setPodcast(await api.getPodcast(id));
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
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted hover:text-ink mb-6 transition-colors">
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
          {podcast.description && <p className="text-muted text-sm">{podcast.description}</p>}
          {podcast.topic && <p className="text-xs text-muted/70 mt-1">Topic: {podcast.topic}</p>}
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
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <div>
            <p className="text-sm font-medium">Generating your podcast...</p>
            <p className="text-xs text-muted">This may take a few minutes.</p>
          </div>
        </div>
      )}

      {/* Episodes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Episodes ({podcast.episodes?.length || 0})</h2>
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
            .map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onGenerateScript={handleGenerateScript}
                onGenerateAudio={handleGenerateAudio}
                generating={generating}
                voices={voices}
              />
            ))}
        </div>
      )}
    </div>
  );
}
