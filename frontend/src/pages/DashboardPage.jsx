import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PlusCircle, Podcast, Clock, ArrowRight, Trash2, Loader2 } from 'lucide-react';

const statusColors = {
  draft: 'bg-muted/10 text-muted',
  generating: 'bg-warning/10 text-warning',
  ready: 'bg-success/10 text-success',
  failed: 'bg-error/10 text-error',
};

export default function DashboardPage() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPodcasts().then(setPodcasts).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this podcast and all its episodes?')) return;
    await api.deletePodcast(id);
    setPodcasts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Podcasts</h1>
          <p className="text-muted mt-1">
            {podcasts.length === 0
              ? 'Create your first AI-powered podcast'
              : `${podcasts.length} podcast${podcasts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          to="/podcasts/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Podcast
        </Link>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Podcast className="w-7 h-7 text-accent" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No podcasts yet</h3>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            Create your first podcast by giving it a title and topic. The AI handles the rest.
          </p>
          <Link
            to="/podcasts/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create your first podcast
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {podcasts.map((podcast) => (
            <Link
              key={podcast.id}
              to={`/podcasts/${podcast.id}`}
              className="group flex items-center gap-5 p-5 bg-white border border-border rounded-xl hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center shrink-0">
                <Podcast className="w-6 h-6 text-accent" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold truncate">{podcast.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[podcast.status] || 'bg-muted/10 text-muted'}`}>
                    {podcast.status}
                  </span>
                </div>
                {podcast.description && (
                  <p className="text-sm text-muted truncate">{podcast.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted/70">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(podcast.created_at).toLocaleDateString()}
                  </span>
                  {podcast.topic && <span className="truncate max-w-xs">{podcast.topic}</span>}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(podcast.id);
                }}
                className="p-2 text-muted/40 hover:text-error rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <ArrowRight className="w-5 h-5 text-muted/30 group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
