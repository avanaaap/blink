import { MessageCircle, Phone, Video, Eye } from 'lucide-react';

interface UnlockProgressBarProps {
  unlockLevel: number;
}

export function UnlockProgressBar({ unlockLevel }: UnlockProgressBarProps) {
  const milestones = [
    { icon: MessageCircle, label: 'Text Chat', level: 0 },
    { icon: Phone, label: 'Voice Call', level: 1 },
    { icon: Video, label: 'Video Call', level: 2 },
    { icon: Eye, label: 'Reveal', level: 3 },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <h3 className="text-sm text-neutral-600 mb-4">Connection Progress</h3>
      <div className="grid grid-cols-4 gap-2 relative">
        {milestones.map((milestone, idx) => {
          const Icon = milestone.icon;
          const isUnlocked = unlockLevel >= milestone.level;
          const isNext = unlockLevel + 1 === milestone.level;

          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isUnlocked
                    ? 'bg-[#4A3B32] text-white'
                    : isNext
                    ? 'text-neutral-700 animate-pulse'
                    : 'bg-neutral-200 text-neutral-400'
                }`}
                style={isNext ? { backgroundColor: '#E8C9A0' } : {}}
              >
                <Icon size={20} />
              </div>
              <span
                className={`text-xs text-center ${
                  isUnlocked ? 'text-[#4A3B32]' : isNext ? 'text-[#4A3B32]/70' : 'text-neutral-400'
                }`}
              >
                {milestone.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500 mt-4 text-center">
        {unlockLevel === 0 && 'Keep chatting to unlock voice calls'}
        {unlockLevel === 1 && 'Build mutual interest to unlock video calls'}
        {unlockLevel === 2 && 'Complete a meaningful video call to reveal your match'}
        {unlockLevel === 3 && 'Profile unlocked! You can now connect'}
      </p>
    </div>
  );
}
