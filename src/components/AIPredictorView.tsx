import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Loader2 } from 'lucide-react';

export function AIPredictorView() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }]);
    setLoading(true);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.result }]);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setMessages(prev => [...prev, { role: 'ai', content: '**Error**: Unable to reach the AI strategist. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-300 text-center">F1 AI Strategist</h2>
            <p className="text-center text-sm max-w-md">
              Ask about race predictions, driver strategies, or historical facts. The AI uses the Gemini model to analyze and respond.
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-white rounded-tr-none' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="markdown-body text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              <span className="ml-3 text-sm text-zinc-500 italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about race predictions, tire strategies..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-500 px-4 py-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
