import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Settings, LogOut, MessageCircle, Phone, Video, Flag, PhoneOff, Loader2, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { getTodayMatch, getAllMatches, getPartnerReveal, declineMatch } from '../../lib/api/match-api';
import { createCallInvite, getPendingInvite, respondToInvite, checkInviteStatus } from '../../lib/api/call-api';
import type { CallInvite } from '../../lib/api/call-api';
import { ReportModal } from '../../components/ReportModal';
import { FloatingHearts } from './FloatingHearts';
import type { MatchDetail } from '../../lib/types';
import type { PartnerReveal } from '../../lib/api/match-api';

export function DashboardScreen() {
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [allMatches, setAllMatches] = useState<MatchDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVoiceUnlockGlow, setShowVoiceUnlockGlow] = useState(false);
  const [showVideoUnlockGlow, setShowVideoUnlockGlow] = useState(false);

  // Partner profile reveal (for level 4+)
  const [partnerReveal, setPartnerReveal] = useState<PartnerReveal | null>(null);
  const [revealPhotoIndex, setRevealPhotoIndex] = useState(0);

  // Call invite state
  const [outgoingInvite, setOutgoingInvite] = useState<CallInvite | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<CallInvite | null>(null);
  const [ringingMode, setRingingMode] = useState<'voice' | 'video' | null>(null);
  const outgoingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const incomingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unlockLevel = match?.unlock_level ?? 0;
  const voiceUnlocked = unlockLevel >= 2;
  const videoUnlocked = unlockLevel >= 3;
  const profileRevealed = unlockLevel >= 4;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [todayResult, pastMatches] = await Promise.all([
          getTodayMatch(),
          getAllMatches(),
        ]);
        setMatch(todayResult.data);
        setAllMatches(pastMatches);

        // Fetch partner reveal if unlocked
        if (todayResult.data && (todayResult.data.unlock_level ?? 0) >= 4) {
          try {
            const reveal = await getPartnerReveal(todayResult.data.id);
            setPartnerReveal(reveal);
          } catch {
            // reveal not available
          }
        }
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

  const handleDeclineMatch = useCallback(async () => {
    if (!match) return;
    try {
      await declineMatch(match.id);
      setMatch(null);
      setPartnerReveal(null);
      setRevealPhotoIndex(0);
    } catch (e) {
      console.error('Failed to decline match:', e);
    }
  }, [match]);

  const revealPhotos = partnerReveal?.photos ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f3] via-white to-[#faf7f3] relative overflow-hidden">
      {/* Background gradient shapes */}
      <div className="absolute top-[-5%] right-[-10%] w-[40%] h-[35%] rounded-full bg-gradient-to-bl from-[#D4A574]/10 to-transparent blur-3xl gradient-blob" />
      <div className="absolute bottom-[10%] left-[-8%] w-[35%] h-[30%] rounded-full bg-gradient-to-tr from-[#D4A574]/8 to-transparent blur-3xl gradient-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[50%] right-[5%] w-[20%] h-[20%] rounded-full bg-gradient-to-tl from-[#E8C9A0]/10 to-transparent blur-2xl gradient-blob" style={{ animationDelay: '3s' }} />

      {/* Floating hearts in background */}
      <FloatingHearts count={6} />

      <div className="max-w-2xl mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <BlinkLogo size={50} className="text-[#4A3B32]" />
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

        {/* Welcome greeting */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4A574]/20 via-[#E8C9A0]/20 to-[#D4A574]/20 border border-[#D4A574]/20">
            <span className="text-sm text-[#4A3B32]/70">Your daily blind date awaits</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#4A3B32] mb-2">
            Ready to see who fate picks?
          </h1>
          <p className="text-neutral-500">
            Every connection starts blind. Trust the process.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#4A3B32] rounded-full animate-spin" />
            <p className="text-neutral-600">Finding your matches...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <>
            {/* Today's Match */}
            {!isPaused && match && (
              <div className="max-w-sm mx-auto mb-8">
                <h3 className="text-xs uppercase tracking-wider text-[#D4A574] font-semibold mb-3">Today's Match</h3>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#D4A574]/30 p-4 shadow-lg shadow-[#D4A574]/5">
                  <div className="flex items-center gap-4 mb-4">
                    {profileRevealed && revealPhotos.length > 0 ? (
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
                        <img
                          src={revealPhotos[revealPhotoIndex]?.url}
                          alt={partnerReveal?.name ?? 'Partner'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-[#D4A574]/40 to-[#4A3B32]/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">?</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#4A3B32]">{match.partner_name}{match.partner_age ? `, ${match.partner_age}` : ''}</p>
                      <p className="text-xs text-neutral-500">
                        {profileRevealed ? 'Profile revealed' : 'Identity hidden'}
                        {match.compatibility_score != null && ` · ${match.compatibility_score}% match`}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => navigate(`${APP_ROUTES.chat}?matchId=${match.id}&unlockLevel=${unlockLevel}`)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4A3B32] px-3 py-2.5 text-white text-sm hover:bg-[#322822] transition-colors"
                    >
                      <MessageCircle size={15} /> Chat
                    </button>
                    <button
                      onClick={() => voiceUnlocked && startCall('voice')}
                      disabled={!voiceUnlocked}
                      className={[
                        'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
                        voiceUnlocked
                          ? 'bg-[#4A3B32] text-white hover:bg-[#322822]'
                          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
                        showVoiceUnlockGlow ? 'ring-2 ring-[#D4A574] ring-offset-2' : '',
                      ].join(' ')}
                    >
                      <Phone size={15} />
                    </button>
                    <button
                      onClick={() => videoUnlocked && startCall('video')}
                      disabled={!videoUnlocked}
                      className={[
                        'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
                        videoUnlocked
                          ? 'bg-[#4A3B32] text-white hover:bg-[#322822]'
                          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
                        showVideoUnlockGlow ? 'ring-2 ring-[#D4A574] ring-offset-2' : '',
                      ].join(' ')}
                    >
                      <Video size={15} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {unlockLevel >= 4 && (
                      <button
                        onClick={() => navigate(`${APP_ROUTES.reveal}?matchId=${match.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#4A3B32] px-3 py-2 text-[#4A3B32] hover:bg-neutral-50 transition-colors text-sm"
                      >
                        <User size={14} /> View Profile
                      </button>
                    )}
                    <button
                      onClick={handleDeclineMatch}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-300 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors text-sm"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isPaused && (
              <div className="max-w-sm mx-auto text-center mb-8">
                <p className="text-neutral-500 mb-4">Matches paused. Resume anytime.</p>
                <Button onClick={() => setIsPaused(false)}>Resume Matches</Button>
              </div>
            )}

            {!isPaused && !match && allMatches.length === 0 && (
              <div className="max-w-sm mx-auto text-center mb-8 py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D4A574]/30 to-[#4A3B32]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">?</span>
                </div>
                <p className="text-neutral-500">No matches yet. Check back soon for a new connection.</p>
              </div>
            )}

            {/* All Matches */}
            {allMatches.length > 0 && (
              <div className="max-w-sm mx-auto">
                <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">All Matches</h3>
                <div className="flex flex-col gap-2">
                  {allMatches.map((m) => {
                    const mUnlock = m.unlock_level ?? 0;
                    const mVoice = mUnlock >= 2;
                    const mVideo = mUnlock >= 3;
                    const mRevealed = mUnlock >= 4;
                    return (
                      <div
                        key={m.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200 p-3 hover:border-[#D4A574]/40 hover:shadow-md hover:shadow-[#D4A574]/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#D4A574]/30 to-[#4A3B32]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm text-[#4A3B32]">
                              {m.partner_name?.charAt(0) ?? '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#4A3B32]">{m.partner_name}{m.partner_age ? `, ${m.partner_age}` : ''}</p>
                            <p className="text-xs text-neutral-500">
                              {m.status === 'connected' ? 'Connected' : `Level ${mUnlock}`}
                              {m.compatibility_score != null && ` · ${m.compatibility_score}%`}
                            </p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => navigate(`${APP_ROUTES.chat}?matchId=${m.id}&unlockLevel=${mUnlock}`)}
                              className="p-2 rounded-full bg-[#4A3B32] text-white hover:bg-[#4A3B32]/80 transition-colors"
                              title="Chat"
                            >
                              <MessageCircle size={14} />
                            </button>
                            {mVoice && (
                              <button
                                onClick={() => navigate(`${APP_ROUTES.voiceCall}?matchId=${m.id}&unlockLevel=${mUnlock}`)}
                                className="p-2 rounded-full bg-[#4A3B32] text-white hover:bg-[#4A3B32]/80 transition-colors"
                                title="Voice Call"
                              >
                                <Phone size={14} />
                              </button>
                            )}
                            {mVideo && (
                              <button
                                onClick={() => navigate(`${APP_ROUTES.videoCall}?matchId=${m.id}&unlockLevel=${mUnlock}`)}
                                className="p-2 rounded-full bg-[#4A3B32] text-white hover:bg-[#4A3B32]/80 transition-colors"
                                title="Video Call"
                              >
                                <Video size={14} />
                              </button>
                            )}
                            {mRevealed && (
                              <button
                                onClick={() => navigate(`${APP_ROUTES.reveal}?matchId=${m.id}`)}
                                className="p-2 rounded-full bg-[#D4A574] text-white hover:bg-[#D4A574]/80 transition-colors"
                                title="View Profile"
                              >
                                <User size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Outgoing call (ringing) overlay */}
      {ringingMode && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#4A3B32]/80 to-[#2a1f18]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <FloatingHearts count={5} />
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full mx-6 text-center relative z-10 shadow-2xl border border-[#D4A574]/20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 p-[3px] bg-gradient-to-br from-[#D4A574] via-[#E8C9A0] to-[#D4A574] animate-pulse">
              <div className="w-full h-full bg-[#4A3B32] rounded-full flex items-center justify-center">
                {ringingMode === 'video' ? <Video size={36} className="text-white" /> : <Phone size={36} className="text-white" />}
              </div>
            </div>
            <h2 className="text-2xl mb-2 text-[#4A3B32]">Calling {match?.partner_name}...</h2>
            <p className="text-neutral-500 mb-6">Waiting for them to pick up</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Loader2 size={16} className="animate-spin text-[#D4A574]" />
              <span className="text-sm text-[#D4A574]">Ringing</span>
            </div>
            <button
              onClick={cancelRinging}
              className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg shadow-red-500/25"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Incoming call modal */}
      {incomingInvite && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#4A3B32]/80 to-[#2a1f18]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <FloatingHearts count={8} />
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full mx-6 text-center relative z-10 shadow-2xl border border-[#D4A574]/20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 p-[3px] bg-gradient-to-br from-green-400 via-green-500 to-green-400 animate-pulse">
              <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                {incomingInvite.mode === 'video' ? <Video size={36} className="text-white" /> : <Phone size={36} className="text-white" />}
              </div>
            </div>
            <h2 className="text-2xl mb-2 text-[#4A3B32]">Incoming {incomingInvite.mode === 'video' ? 'Video' : 'Voice'} Call</h2>
            <p className="text-neutral-500 mb-8">{match?.partner_name} is calling you</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={declineIncoming}
                className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center transition-all shadow-lg shadow-red-500/25"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
              <button
                onClick={acceptIncoming}
                className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center transition-all shadow-lg shadow-green-500/25"
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
