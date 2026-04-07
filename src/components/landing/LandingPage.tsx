import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { GraduationCap, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [input, setInput] = useState('');
  const { setName } = useUser();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setName(trimmed);
    navigate('/learn');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-600 text-white mb-4 shadow-lg">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Padh<span className="text-brand-600">AI</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Your AI Math Tutor</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-400">
            <Sparkles size={14} />
            <span>CBSE Class 8 — NCERT Mathematics</span>
          </div>
        </div>

        {/* Name Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Welcome! 👋
          </h2>
          <p className="text-gray-500 mb-6">
            Enter your name to start learning
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g., Aarav, Priya, Rohan..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-lg transition-colors"
              autoFocus
              maxLength={30}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold text-lg hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              Start Learning
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Friendly AI Tutor', 'Interactive Quizzes', 'Visual Diagrams'].map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-gray-600 border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
