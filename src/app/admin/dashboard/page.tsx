'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'predictions' | 'blog'>('predictions');

  const [matchName, setMatchName] = useState('');
  const [pick, setPick] = useState('');
  const [odds, setOdds] = useState('');
  const [category, setCategory] = useState<'free' | 'vip'>('free');
  const [pickDate, setPickDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Pending' | 'WON' | 'LOSS'>('Pending');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== 'danielokereke2018@gmail.com') {
        router.push('/');
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    }
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        Checking admin clearance...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const handlePickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving pick...');

    const { error } = await supabase.from('predictions').insert([
      {
        match_name: matchName,
        pick: pick,
        odds: parseFloat(odds),
        category: category,
        date: pickDate,
        status: status,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Pick updated successfully!');
      setMatchName('');
      setPick('');
      setOdds('');
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Publishing post...');

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { error } = await supabase.from('blog_posts').insert([
      {
        title,
        slug,
        content,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Blog post published successfully!');
      setTitle('');
      setContent('');
      setImageUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-6">2Odds Admin Management</h1>

        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('predictions')}
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'predictions' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-300'
            }`}
          >
            Manage Picks & Results
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'blog' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-300'
            }`}
          >
            Publish Blog Post
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-200">
            {message}
          </div>
        )}

        {activeTab === 'predictions' && (
          <form onSubmit={handlePickSubmit} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Add Pick / Update Result</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'free' | 'vip')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                >
                  <option value="free">Free Pick</option>
                  <option value="vip">VIP Pick</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">DATE</label>
                <input
                  type="date"
                  value={pickDate}
                  onChange={(e) => setPickDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">MATCH (e.g. Zenit vs FC Rostov)</label>
                <input
                  type="text"
                  value={matchName}
                  onChange={(e) => setMatchName(e.target.value)}
                  placeholder="Home vs Away"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">SELECTION / PICK</label>
                <input
                  type="text"
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                  placeholder="e.g. 1X or OVER 2.5 GOALS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ODDS</label>
                <input
                  type="number"
                  step="0.01"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  placeholder="1.85"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">STATUS / RESULT</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Pending' | 'WON' | 'LOSS')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                >
                  <option value="Pending">Pending (Today's Pick)</option>
                  <option value="WON">WON (Result Update)</option>
                  <option value="LOSS">LOSS (Result Update)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition"
            >
              Publish Match Entry
            </button>
          </form>
        )}

        {activeTab === 'blog' && (
          <form onSubmit={handleBlogSubmit} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Blog Article</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">ARTICLE TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 5 Bankroll Mistakes to Avoid in Sports Betting"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">FEATURED IMAGE URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">ARTICLE CONTENT</label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write article here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition"
            >
              Publish Blog Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
