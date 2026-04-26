import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Settings, LogOut, MessageCircle, Phone, Video, Flag, PhoneOff, Loader2, User, History } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { getTodayMatch } from '../../lib/api/match-api';
import { createCallInvite, getPendingInvite, respondToInvite, checkInviteStatus } from '../../lib/api/call-api';
import type { CallInvite } from '../../lib/api/call-api';
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

  // Call invite state
  const [outgoingInvite, setOutgoingInvite] = useState<CallInvite | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<CallInvite | null>(null);
  const [ringingMode, setRingingMode] = useState<'voice' | 'video' | null>(null);
  const outgoingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const incomingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Poll for incoming call invites
  useEffect(() => {
    if (!match) return;

    const poll = async () => {
      try {
        const invite = await getPendingInvite();
        if (invite && invite.status === 'pending') {
          setIncomingInvite(invite);
        }
      } catch {
        // ignore polling errors
      }
    };

    void poll();
    incomingPollRef.current = setInterval(poll, 3000);
    return () => {
      if (incomingPollRef.current) clearInterval(incomingPollRef.current);
    };
  }, [match]);

  // Poll for outgoing invite status
  useEffect(() => {
    if (!outgoingInvite) return;

    const poll = async () => {
      try {
        const updated = await checkInviteStatus(outgoingInvite.id);
        if (updated.status === 'accepted') {
          cancelRinging();
          const route = outgoingInvite.mode === 'video' ? APP_ROUTES.videoCall : APP_ROUTES.voiceCall;
          navigate(`${route}?matchId=${outgoingInvite.match_id}&unlockLevel=${unlockLevel}`);
        } else if (updated.status === 'declined' || updated.status === 'expired') {
          cancelRinging();
        }
      } catch {
        // ignore polling errors
      }
    };

    outgoingPollRef.current = setInterval(poll, 2000);
    return () => {
      if (outgoingPollRef.current) clearInterval(outgoingPollRef.current);
    };
  }, [outgoingInvite, navigate, unlockLevel]);

  const startCall = useCallback(async (mode: 'voice' | 'video') => {
    if (!match) return;
    setRingingMode(mode);
    try {
      const invite = await createCallInvite(match.id, mode);
      setOutgoingInvite(invite);
    } catch {
      setRingingMode(null);
    }
  }, [match]);

  const cancelRinging = useCallback(() => {
    setRingingMode(null);
    setOutgoingInvite(null);
    if (outgoingPollRef.current) {
      clearInterval(outgoingPollRef.current);
      outgoingPollRef.current = null;
    }
  }, []);

  const acceptIncoming = useCallback(async () => {
    if (!incomingInvite) return;
    try {
      await respondToInvite(incomingInvite.id, 'accept');
      const route = incomingInvite.mode === 'video' ? APP_ROUTES.videoCall : APP_ROUTES.voiceCall;
      setIncomingInvite(null);
      navigate(`${route}?matchId=${incomingInvite.match_id}&unlockLevel=${unlockLevel}`);
    } catch {
      setIncomingInvite(null);
    }
  }, [incomingInvite, navigate, unlockLevel]);

  const declineIncoming = useCallback(async () => {
    if (!incomingInvite) return;
    try {
      await respondToInvite(incomingInvite.id, 'decline');
    } catch {
      // ignore
    }
    setIncomingInvite(null);
  }, [incomingInvite]);

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
                    onClick={() => voiceUnlocked && startCall('voice')}
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
                    onClick={() => videoUnlocked && startCall('video')}
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

              {unlockLevel >= 4 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => navigate(`${APP_ROUTES.reveal}?matchId=${match.id}`)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#4A3B32] px-3 py-2 text-[#4A3B32] hover:bg-neutral-50 transition-colors text-sm"
                  >
                    <User size={15} />
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate(APP_ROUTES.conversationHistory)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm"
                  >
                    <History size={15} />
                    Chat History
                  </button>
                </div>
              )}
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

      {/* Outgoing call (ringing) overlay */}
      {ringingMode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center">
            <div className="w-20 h-20 bg-[#4A3B32] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              {ringingMode === 'video' ? <Video size={36} className="text-white" /> : <Phone size={36} className="text-white" />}
            </div>
            <h2 className="text-2xl mb-2">Calling {match?.partner_name}...</h2>
            <p className="text-neutral-600 mb-6">Waiting for them to pick up</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Loader2 size={16} className="animate-spin text-neutral-400" />
              <span className="text-sm text-neutral-500">Ringing</span>
            </div>
            <button
              onClick={cancelRinging}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center mx-auto transition-colors"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Incoming call modal */}
      {incomingInvite && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              {incomingInvite.mode === 'video' ? <Video size={36} className="text-white" /> : <Phone size={36} className="text-white" />}
            </div>
            <h2 className="text-2xl mb-2">Incoming {incomingInvite.mode === 'video' ? 'Video' : 'Voice'} Call</h2>
            <p className="text-neutral-600 mb-8">{match?.partner_name} is calling you</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={declineIncoming}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
              <button
                onClick={acceptIncoming}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Phone size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        sourceLabel="From match screen"
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
