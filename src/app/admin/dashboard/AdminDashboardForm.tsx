"use client";

import { useState } from "react";
import { submitPick, submitBlogPost } from "./actions";

export function AdminDashboardForm() {
  const [activeTab, setActiveTab] = useState<"predictions" | "blog">("predictions");

  // Single Pick Form State
  const [matchName, setMatchName] = useState("");
  const [pick, setPick] = useState("");
  const [odds, setOdds] = useState("");
  const [category, setCategory] = useState<"free" | "vip">("free");
  const [pickDate, setPickDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"Pending" | "WON" | "LOSS">("Pending");

  // Blog Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [message, setMessage] = useState("");

  // Submit Prediction (Free/VIP)
  const handlePickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving pick...");

    const { error } = await submitPick({
      matchName,
      pick,
      odds: parseFloat(odds),
      category,
      date: pickDate,
      status,
    });

    if (error) {
      setMessage(`Error: ${error}`);
    } else {
      setMessage("Pick updated successfully!");
      setMatchName("");
      setPick("");
      setOdds("");
    }
  };

  // Submit Blog Post
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Publishing post...");

    const { error } = await submitBlogPost({ title, content, imageUrl });

    if (error) {
      setMessage(`Error: ${error}`);
    } else {
      setMessage("Blog post published successfully!");
      setTitle("");
      setContent("");
      setImageUrl("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-6">2Odds Admin Management</h1>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("predictions")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "predictions" ? "bg-emerald-500 text-black" : "bg-slate-900 text-slate-300"
            }`}
          >
            Manage Picks & Results
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "blog" ? "bg-emerald-500 text-black" : "bg-slate-900 text-slate-300"
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

        {/* Tab 1: Update Picks */}
        {activeTab === "predictions" && (
          <form onSubmit={handlePickSubmit} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Add Pick / Update Result</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "free" | "vip")}
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
                  onChange={(e) => setStatus(e.target.value as "Pending" | "WON" | "LOSS")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
                >
                  <option value="Pending">Pending (Today&apos;s Pick)</option>
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

        {/* Tab 2: Write Blog Post */}
        {activeTab === "blog" && (
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">FEATURED IMAGE URL (Google Flow / OpenArt)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">ARTICLE CONTENT (Markdown / HTML)</label>
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

export default AdminDashboardForm;
