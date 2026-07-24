import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  enclosure?: {
    url: string;
  };
  contentSnippet?: string;
  content?: string;
}

export function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/f1-news');
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        setNews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-accent-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-sm">Loading Latest News...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
        <p className="text-red-400 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-accent-600/20 p-3 rounded-lg">
          <Newspaper className="w-6 h-6 text-accent-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">F1 News</h2>
          <p className="text-sm text-zinc-400 font-medium">Latest stories from the grid</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10"
          >
            {item.enclosure?.url ? (
              <div className="relative h-48 overflow-hidden bg-zinc-950">
                <img
                  src={item.enclosure.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-80" />
              </div>
            ) : (
              <div className="h-48 bg-zinc-800 flex items-center justify-center">
                <Newspaper className="w-12 h-12 text-zinc-700" />
              </div>
            )}
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-500 uppercase tracking-widest mb-3">
                <span>{new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              
              <h3 className="text-lg font-bold leading-tight mb-3 group-hover:text-accent-500 transition-colors line-clamp-3">
                {item.title}
              </h3>
              
              <p className="text-sm text-zinc-400 line-clamp-3 mb-4 flex-1">
                {item.contentSnippet || item.content?.replace(/<[^>]+>/g, '').substring(0, 150) + '...'}
              </p>
              
              <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <span>Read Full Story</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
