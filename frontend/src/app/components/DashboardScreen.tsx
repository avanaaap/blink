import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Settings, LogOut, MessageCircle, Phone, Video, Flag } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { getTodayMatch } from '../../lib/api/match-api';
import { ReportModal } from '../../components/ReportModal';
import type { MatchDetail } from '../../lib/types';

export function DashboardScreen() {
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVoiceUnlockGlow, setShowVoiceUnlockGlow] = useState(false);
  const [showVideoUnlockGlow, setShowVideoUnlockGlow] = useState(false);

  const unlockLevel = match?.unlock_level ?? 0;
  const voiceUnlocked = unlockLevel >= 2;
  const videoUnlocked = unlockLevel >= 3;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getTodayMatch();
        setMatch(result.data);
      } catch {
        setError('Failed to load match. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!voiceUnlocked) return;
    setShowVoiceUnlockGlow(true);
    const timer = setTimeout(() => setShowVoiceUnlockGlow(false), 2200);
    return () => clearTimeout(timer);
  }, [voiceUnlocked]);

  useEffect(() => {
    if (!videoUnlocked) return;
    setShowVideoUnlockGlow(true);
    const timer = setTimeout(() => setShowVideoUnlockGlow(false), 2200);
    return () => clearTimeout(timer);
  }, [videoUnlocked]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <BlinkLogo size={50} className="text-black" />
          <div className="flex gap-3">
            {match && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Report from match screen"
              >
                <Flag size={24} />
              </button>
            )}
            <button
              onClick={() => navigate(APP_ROUTES.settings)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <Settings size={24} />
            </button>
            <button
              onClick={() => navigate(APP_ROUTES.landing)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#4A3B32] rounded-full animate-spin" />
            <p className="text-neutral-600">Finding your match...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : !isPaused && match ? (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h1 className="text-4xl mb-3">Today's Match</h1>
              <p className="text-neutral-600">Your blind date awaits</p>
            </div>

            <div className="w-full bg-neutral-50 rounded-3xl p-8 border-2 border-neutral-200">
              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-neutral-300 to-neutral-400 rounded-full flex items-center justify-center">
                  <span className="text-5xl">?</span>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl mb-2">{match.partner_name}, {match.partner_age}</h2>
                  <p className="text-neutral-600">Profile hidden until trust is earned</p>
                </div>

                {match.shared_interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {match.shared_interests.slice(0, 3).map(interest => (
                      <span
                        key={interest}
                        className="px-4 py-2 bg-white border border-neutral-300 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {match.compatibility_score != null && (
                  <div className="w-full bg-white rounded-xl p-4 border border-neutral-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">Compatibility</span>
                      <span className="text-sm">{match.compatibility_score}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-[#4A3B32] h-2 rounded-full transition-all"
                        style={{ width: `${match.compatibility_score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
                <h3 className="mb-2 text-[13px] text-neutral-600">Conversation-first unlock flow</h3>
                <div className="space-y-1.5 text-sm">
                  <button
                    onClick={() => navigate(`${APP_ROUTES.chat}?matchId=${match.id}&unlockLevel=${unlockLevel}`)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#4A3B32] bg-[#4A3B32] px-3 py-1.5 text-left text-white"
                  >
                    <span className="flex items-center gap-2"><MessageCircle size={15} /> Text Messages</span>
                    <span className="text-[11px] text-white/90">Available</span>
                  </button>
                  <button
                    onClick={() => voiceUnlocked && navigate(`${APP_ROUTES.voiceCall}?matchId=${match.id}&unlockLevel=${unlockLevel}`)}
                    disabled={!voiceUnlocked}
                    className={[
                      'flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left transition-colors',
                      voiceUnlocked
                        ? 'border-[#4A3B32] bg-[#4A3B32] text-white'
                        : 'cursor-not-allowed border-neutral-200 bg-white text-neutral-500',
                      showVoiceUnlockGlow ? 'voice-unlock-glow' : '',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2"><Phone size={15} /> Voice Call</span>
                    <span className={voiceUnlocked ? 'text-[11px] text-white/90' : 'text-[11px] text-neutral-500'}>
                      {voiceUnlocked ? 'Available' : 'Locked'}
                    </span>
                  </button>
                  <button
                    onClick={() => videoUnlocked && navigate(`${APP_ROUTES.videoCall}?matchId=${match.id}&unlockLevel=${unlockLevel}`)}
                    disabled={!videoUnlocked}
                    className={[
                      'flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left transition-colors',
                      videoUnlocked
                        ? 'border-[#4A3B32] bg-[#4A3B32] text-white'
                        : 'cursor-not-allowed border-neutral-200 bg-white text-neutral-500',
                      showVideoUnlockGlow ? 'voice-unlock-glow' : '',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2"><Video size={15} /> Video Call</span>
                    <span className={videoUnlocked ? 'text-[11px] text-white/90' : 'text-[11px] text-neutral-500'}>
                      {videoUnlocked ? 'Available' : 'Locked'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl mb-3">
                {isPaused ? 'Matches Paused' : 'No Matches Yet'}
              </h1>
              <p className="text-neutral-600">
                {isPaused
                  ? 'Resume anytime to start receiving matches'
                  : 'No compatible matches found today. Check back tomorrow for a new connection.'}
              </p>
            </div>

            {isPaused && (
              <Button onClick={() => setIsPaused(false)}>
                Resume Matches
              </Button>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        sourceLabel="From match screen"
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
