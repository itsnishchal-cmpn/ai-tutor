import { useState } from 'react';
import { badges as badgeDefs } from '../../data/badgeDefinitions';

interface Props { badgeName: string; badgeIcon: string; onDone: () => void; }

function getBadgeRarity(badgeName: string): 'common' | 'rare' | 'epic' | 'legendary' {
  const badge = badgeDefs.find(b => b.name === badgeName);
  if (!badge) return 'common';
  const epicBadges = ['Shape Master', 'Chapter Champion'];
  const legendaryBadges = ['PadhAI Pro'];
  const rareBadges = ['7-Day Streak', 'Quick Learner'];
  if (legendaryBadges.includes(badge.name)) return 'legendary';
  if (epicBadges.includes(badge.name)) return 'epic';
  if (rareBadges.includes(badge.name)) return 'rare';
  return 'common';
}

const rarityConfig = {
  common: { ring: 'ring-amber-300', bg: 'bg-amber-50', label: 'Common', labelColor: 'text-amber-700', borderColor: 'border-amber-200' },
  rare: { ring: 'ring-indigo-300', bg: 'bg-indigo-50', label: 'Rare', labelColor: 'text-indigo-600', borderColor: 'border-indigo-200' },
  epic: { ring: 'ring-amber-500', bg: 'bg-amber-50', label: 'Epic', labelColor: 'text-amber-600', borderColor: 'border-amber-300' },
  legendary: { ring: 'ring-violet-500', bg: 'bg-violet-50', label: 'Legendary', labelColor: 'text-violet-600', borderColor: 'border-violet-300' },
};

export default function BadgeUnlock({ badgeName, badgeIcon, onDone }: Props) {
  const [closing, setClosing] = useState(false);
  const rarity = getBadgeRarity(badgeName);
  const config = rarityConfig[rarity];
  const handleClose = () => { setClosing(true); setTimeout(onDone, 300); };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative max-w-sm mx-4 w-full animate-bounce-in">
        <div className={`bg-white rounded-3xl p-8 text-center border ${config.borderColor} overflow-hidden relative`} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.1)' }}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-violet-500 to-indigo-500 rounded-t-3xl" />

          <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${config.bg} ring-4 ${config.ring} flex items-center justify-center`} style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
            <span className="text-5xl">{badgeIcon}</span>
          </div>
          <span className={`inline-block text-xs font-bold uppercase tracking-wider ${config.labelColor} mb-2`}>{config.label}</span>
          <h2 className="text-xl font-extrabold text-[#1E293B] mb-1">New Badge Unlocked!</h2>
          <p className="text-lg text-indigo-600 font-bold mb-6">{badgeName}</p>
          <button onClick={handleClose} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-lg transition-all btn-press" style={{ boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)' }}>
            Nice!
          </button>
        </div>
      </div>
    </div>
  );
}
