import { useState } from 'react';
import { useGamification } from '../../contexts/GamificationContext';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import { badges as badgeDefs } from '../../data/badgeDefinitions';
import { getItem, setItem } from '../../lib/storage';
import {
  X, Volume2, VolumeX, Mic, Award, RotateCcw, LogOut, CheckCircle2, Lock,
} from 'lucide-react';

const VOICE_OPTIONS = [
  { id: 'nova', label: 'Nova', desc: 'Warm & friendly' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft & clear' },
  { id: 'alloy', label: 'Alloy', desc: 'Neutral & balanced' },
  { id: 'echo', label: 'Echo', desc: 'Calm & deep' },
  { id: 'fable', label: 'Fable', desc: 'Expressive & British' },
  { id: 'onyx', label: 'Onyx', desc: 'Deep & authoritative' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsModal({ isOpen, onClose, onLogout }: Props) {
  const { name } = useUser();
  const { gamification, toggleSound, resetGamification } = useGamification();
  const { resetProgress } = useProgress();
  const [selectedVoice, setSelectedVoice] = useState(() => getItem<string>('tts_voice', 'nova'));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  const earnedBadges = badgeDefs.filter(b => gamification.badges.includes(b.id));

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    setItem('tts_voice', voice);
  };

  const handleReset = () => {
    resetProgress();
    resetGamification();
    setShowResetConfirm(false);
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('padhai_')) {
        localStorage.removeItem(k);
      }
    });
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Settings panel — slides from right */}
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-[#1E293B] text-lg">
            {showBadges ? 'My Achievements' : 'Settings'}
          </h2>
          <button onClick={showBadges ? () => setShowBadges(false) : onClose} className="p-1.5 hover:bg-gray-100 rounded-lg btn-press">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {showBadges ? (
          /* Badge shelf */
          <div className="p-5 space-y-3">
            <p className="text-sm text-[#64748B] mb-4">
              {earnedBadges.length}/{badgeDefs.length} badges earned
            </p>
            {badgeDefs.map(b => {
              const earned = gamification.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    earned
                      ? 'bg-violet-50 border-violet-200 shadow-sm'
                      : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}
                >
                  <span className={`text-3xl ${earned ? '' : 'grayscale'}`}>{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${earned ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>{b.name}</p>
                    <p className={`text-xs ${earned ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>{b.description}</p>
                  </div>
                  {earned ? (
                    <CheckCircle2 size={18} className="text-violet-500 shrink-0" />
                  ) : (
                    <Lock size={16} className="text-[#94A3B8] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Settings content */
          <div className="p-5 space-y-6">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                {name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-semibold text-[#1E293B]">{name}</p>
                <p className="text-xs text-[#64748B]">Class 8 - Mathematics</p>
              </div>
            </div>

            {/* Badges shortcut */}
            <button
              onClick={() => setShowBadges(true)}
              className="w-full flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-xl btn-press"
            >
              <div className="flex items-center gap-3">
                <Award size={22} className="text-violet-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1E293B]">My Achievements</p>
                  <p className="text-xs text-[#64748B]">{earnedBadges.length}/{badgeDefs.length} badges earned</p>
                </div>
              </div>
              <div className="flex gap-1">
                {earnedBadges.slice(0, 3).map(b => (
                  <span key={b.id} className="text-lg">{b.icon}</span>
                ))}
                {earnedBadges.length > 3 && (
                  <span className="text-xs text-[#64748B] self-center">+{earnedBadges.length - 3}</span>
                )}
              </div>
            </button>

            {/* Sound toggle */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Audio</h3>
              <button
                onClick={toggleSound}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {gamification.soundEnabled ? <Volume2 size={18} className="text-indigo-500" /> : <VolumeX size={18} className="text-[#94A3B8]" />}
                  <span className="text-sm text-[#1E293B]">Sound Effects</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${gamification.soundEnabled ? 'bg-indigo-500' : 'bg-gray-300'} relative`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${gamification.soundEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </div>
              </button>

              {/* Voice selector */}
              <div className="p-3 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-2">
                  <Mic size={16} className="text-[#64748B]" />
                  <span className="text-sm text-[#1E293B]">AI Voice</span>
                </div>
                <select
                  value={selectedVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                >
                  {VOICE_OPTIONS.map(v => (
                    <option key={v.id} value={v.id}>{v.label} — {v.desc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Danger zone */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Account</h3>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] hover:bg-gray-50 transition-colors text-[#1E293B]"
              >
                <LogOut size={18} />
                <span className="text-sm">Switch User</span>
              </button>

              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-error-200 hover:bg-error-50 transition-colors text-error-500"
                >
                  <RotateCcw size={18} />
                  <span className="text-sm">Reset All Progress</span>
                </button>
              ) : (
                <div className="bg-error-50 rounded-xl p-4 border border-error-200">
                  <p className="text-sm text-error-700 mb-3">
                    This will clear all your progress, quiz results, and XP. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleReset} className="flex-1 px-3 py-2 bg-error-500 text-white rounded-lg text-sm font-medium hover:bg-error-600 btn-press">
                      Yes, Reset
                    </button>
                    <button onClick={() => setShowResetConfirm(false)} className="flex-1 px-3 py-2 bg-white text-[#1E293B] rounded-lg text-sm border border-[#E2E8F0] hover:bg-gray-50 btn-press">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
