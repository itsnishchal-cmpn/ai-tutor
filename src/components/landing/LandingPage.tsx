import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { ArrowRight, Sparkles, BookOpen, Target, Mic, Trophy, Zap } from 'lucide-react';

// Animated floating math shapes — adds gamification energy to premium base
function FloatingMathShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Geometric shapes with soft brand colors */}
      <div className="absolute top-[8%] left-[6%] animate-float" style={{ animationDelay: '0s' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" opacity="0.12">
          <polygon points="20,2 38,38 2,38" fill="#6366F1" />
        </svg>
      </div>
      <div className="absolute top-[15%] right-[8%] animate-float" style={{ animationDelay: '2s' }}>
        <svg width="36" height="36" viewBox="0 0 36 36" opacity="0.1">
          <rect x="4" y="4" width="28" height="28" rx="3" fill="#6366F1" transform="rotate(15 18 18)" />
        </svg>
      </div>
      <div className="absolute top-[45%] left-[4%] animate-float" style={{ animationDelay: '1s' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" opacity="0.08">
          <circle cx="16" cy="16" r="14" fill="#F59E0B" />
        </svg>
      </div>
      <div className="absolute bottom-[28%] right-[6%] animate-float" style={{ animationDelay: '3s' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" opacity="0.1">
          <polygon points="22,2 42,16 35,40 9,40 2,16" fill="#8B5CF6" />
        </svg>
      </div>
      <div className="absolute bottom-[15%] left-[10%] animate-float" style={{ animationDelay: '4s' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" opacity="0.09">
          <polygon points="14,1 17,10 27,10 19,16 22,26 14,20 6,26 9,16 1,10 11,10" fill="#F59E0B" />
        </svg>
      </div>
      {/* Math symbols */}
      <div className="absolute top-[30%] right-[15%] animate-float text-indigo-300/20 text-4xl font-bold select-none" style={{ animationDelay: '1.5s' }}>
        +
      </div>
      <div className="absolute top-[60%] left-[8%] animate-float text-amber-300/15 text-3xl font-bold select-none" style={{ animationDelay: '2.5s' }}>
        =
      </div>
      <div className="absolute bottom-[40%] right-[4%] animate-float text-violet-300/15 text-4xl font-bold select-none" style={{ animationDelay: '0.5s' }}>
        %
      </div>
      {/* Subtle radial glow spots */}
      <div className="absolute top-[10%] right-[25%] w-48 h-48 bg-indigo-400 rounded-full blur-[100px] opacity-[0.06]" />
      <div className="absolute bottom-[20%] left-[15%] w-40 h-40 bg-amber-400 rounded-full blur-[80px] opacity-[0.05]" />
    </div>
  );
}

const features = [
  { icon: <BookOpen size={20} />, label: 'AI Lessons', desc: 'Step-by-step concept cards powered by AI', gradient: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50' },
  { icon: <Target size={20} />, label: 'Fun Quizzes', desc: '3-attempt quizzes with hints and celebrations', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
  { icon: <Mic size={20} />, label: 'Voice Mode', desc: 'Listen to explanations, ask doubts by speaking', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
  { icon: <Trophy size={20} />, label: 'XP & Badges', desc: 'Earn points, streaks, and unlock achievements', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
];

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
    <div className="min-h-screen bg-[#FAFBFC] relative overflow-y-auto"
      style={{ background: 'linear-gradient(170deg, #FAFBFC 0%, #EEF2FF 40%, #FEF9EF 70%, #FAFBFC 100%)' }}
    >
      <FloatingMathShapes />

      <div className="flex items-center justify-center px-4 py-10 min-h-screen relative z-10">
        <div className="max-w-md w-full">
          {/* Logo & Branding */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-4 p-4"
              style={{ boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#1E293B] tracking-tight">
              Padh<span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-[#64748B] mt-1.5 text-base">Your AI Math Buddy</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-sm font-semibold text-indigo-500">Learn. Play. Master!</span>
              <Sparkles size={14} className="text-amber-500" />
            </div>
          </div>

          {/* Name Input Card */}
          <div
            className="bg-white rounded-2xl p-7 sm:p-8 animate-fade-in-up relative overflow-hidden"
            style={{
              animationDelay: '0.1s',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Subtle accent stripe at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500" />

            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap size={15} className="text-amber-600 fill-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1E293B]">Ready to Learn?</h2>
            </div>
            <p className="text-[#64748B] text-sm mb-6">
              Enter your name to begin your math journey
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name" className="block text-sm font-medium text-[#475569] mb-1.5">
                What should we call you?
              </label>
              <input
                id="name"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g., Aarav, Priya, Rohan..."
                className="w-full px-4 py-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] placeholder-[#94A3B8] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-base transition-all"
                autoFocus
                maxLength={30}
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 btn-press"
                style={{
                  boxShadow: input.trim() ? '0 3px 12px rgba(79, 70, 229, 0.35)' : 'none',
                }}
              >
                Start Learning
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Mini XP teaser */}
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                Earn XP
              </div>
              <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                <Trophy size={12} className="text-indigo-500" />
                Win Badges
              </div>
              <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                <Flame size={12} className="text-orange-500" />
                Build Streaks
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {features.map(f => (
              <div
                key={f.label}
                className={`${f.bg} rounded-xl p-3.5 border border-white/60 hover:scale-[1.02] transition-transform cursor-default`}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-2.5`}
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                >
                  {f.icon}
                </div>
                <p className="text-[13px] font-bold text-[#1E293B] leading-tight">{f.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <p className="text-center text-xs text-[#94A3B8] mt-6">
            CBSE Class 8 · NCERT Mathematics · Free to use
          </p>
        </div>
      </div>
    </div>
  );
}

// Small helper icons used in the teaser section
function Star(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Flame(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.17 3.38-7.75.42-.53 1.24-.42 1.5.19.5 1.17 1.25 2.25 2.4 3.06.1-.85.4-2.1 1.22-3.5C12.78 4.83 14 3.12 14 3.12s.78 1.71 1.5 3.38c.6 1.4.9 2.65 1 3.5 1.15-.81 1.9-1.89 2.4-3.06.26-.61 1.08-.72 1.5-.19C21.65 8.33 23.78 11.31 23.78 14.5c0 4.42-4.03 8-9 8z" />
    </svg>
  );
}
