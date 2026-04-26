import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Settings, LogOut, MessageCircle, Phone, Video, Flag, PhoneOff, Loader2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { getTodayMatch, getAllMatches, getPartnerReveal } from '../../lib/api/match-api';
import { createCallInvite, getPendingInvite, respondToInvite, checkInviteStatus } from '../../lib/api/call-api';
import type { CallInvite } from '../../lib/api/call-api';
import { ReportModal } from '../../components/ReportModal';
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

  const revealPhotos = partnerReveal?.photos ?? [];

  return (
    <div className="min-h-screen bg-[#faf7f3]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <BlinkLogo size={50} className="text-[#4A3B32]" />
          <div className="flex gap-3">
            {match && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 hover:bg-white/80 rounded-full transition-colors text-[#4A3B32]"
                aria-label="Report from match screen"
              >
                <Flag size={24} />
              </button>
            )}
            <button
              onClick={() => navigate(APP_ROUTES.settings)}
              className="p-2 hover:bg-white/80 rounded-full transition-colors text-[#4A3B32]"
            >
              <Settings size={24} />
            </button>
            <button
              onClick={() => navigate(APP_ROUTES.landing)}
              className="p-2 hover:bg-white/80 rounded-full transition-colors text-[#4A3B32]"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 border-4 border-[#D4A574]/30 border-t-[#4A3B32] rounded-full animate-spin" />
            <p className="text-[#4A3B32]/70">Finding your match...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : !isPaused && match ? (
          <div className="flex flex-col gap-8">
            {/* TODAY'S MATCH */}
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider text-[#D4A574] mb-4">Today's Match</h2>

              <div className="bg-white rounded-3xl border border-[#D4A574]/30 overflow-hidden shadow-sm">
                {/* Partner profile photo (level 4+) */}
                {profileRevealed && revealPhotos.length > 0 ? (
                  <div className="relative aspect-[4/3] w-full bg-neutral-100">
                    <img
                      src={revealPhotos[revealPhotoIndex]?.url}
                      alt={`${partnerReveal?.name ?? 'Partner'} photo`}
                      className="h-full w-full object-cover"
                    />
                    {revealPhotos.length > 1 && (
                      <>
                        <button
                          onClick={() => setRevealPhotoIndex((i) => (i - 1 + revealPhotos.length) % revealPhotos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#4A3B32]/60 p-2 text-white hover:bg-[#4A3B32]/80"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => setRevealPhotoIndex((i) => (i + 1) % revealPhotos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#4A3B32]/60 p-2 text-white hover:bg-[#4A3B32]/80"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5 rounded-full bg-[#4A3B32]/40 px-3 py-1">
                          {revealPhotos.map((_, i) => (
                            <div key={i} className={`h-1.5 w-5 rounded-full ${i === revealPhotoIndex ? 'bg-white' : 'bg-white/40'}`} />
                          ))}
                        </div>
                      </>
                    )}
                    {revealPhotos[revealPhotoIndex]?.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#4A3B32]/70 px-4 py-2">
                        <p className="text-sm text-white">{revealPhotos[revealPhotoIndex].caption}</p>
                      </div>
                    )}
                  </div>
                ) : !profileRevealed ? (
                  <div className="flex flex-col items-center gap-4 py-12 px-8">
                    <div className="w-28 h-28 bg-gradient-to-br from-[#D4A574]/30 to-[#4A3B32]/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl text-[#4A3B32]/40">?</span>
                    </div>
                  </div>
                ) : null}

                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl text-[#4A3B32]">{match.partner_name}, {match.partner_age}</h3>
                    {!profileRevealed && (
                      <p className="text-[#4A3B32]/60 text-sm mt-1">Profile hidden until trust is earned</p>
                    )}
                  </div>

                  {/* Partner interests (from reveal or shared) */}
                  {profileRevealed && partnerReveal?.interests && partnerReveal.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {partnerReveal.interests.map(interest => (
                        <span key={interest} className="px-3 py-1.5 bg-[#D4A574]/15 border border-[#D4A574]/30 rounded-full text-sm text-[#4A3B32]">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : match.shared_interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {match.shared_interests.slice(0, 3).map(interest => (
                        <span key={interest} className="px-3 py-1.5 bg-[#D4A574]/15 border border-[#D4A574]/30 rounded-full text-sm text-[#4A3B32]">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Compatibility score */}
                  {match.compatibility_score != null && (
                    <div className="bg-[#faf7f3] rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#4A3B32]/70">Compatibility</span>
                        <span className="text-sm font-medium text-[#4A3B32]">{match.compatibility_score}%</span>
                      </div>
                      <div className="w-full bg-[#D4A574]/20 rounded-full h-2">
                        <div
                          className="bg-[#D4A574] h-2 rounded-full transition-all"
                          style={{ width: `${match.compatibility_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlock flow buttons */}
                  <div className="space-y-1.5 text-sm">
                    <button
                      onClick={() => navigate(`${APP_ROUTES.chat}?matchId=${match.id}&unlockLevel=${unlockLevel}`)}
                      className="flex w-full items-center justify-between rounded-lg border border-[#4A3B32] bg-[#4A3B32] px-3 py-2 text-left text-white"
                    >
                      <span className="flex items-center gap-2"><MessageCircle size={15} /> Text Messages</span>
                      <span className="text-[11px] text-white/90">Available</span>
                    </button>
                    <button
                      onClick={() => voiceUnlocked && startCall('voice')}
                      disabled={!voiceUnlocked}
                      className={[
                        'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                        voiceUnlocked
                          ? 'border-[#4A3B32] bg-[#4A3B32] text-white'
                          : 'cursor-not-allowed border-[#D4A574]/30 bg-white text-[#4A3B32]/40',
                        showVoiceUnlockGlow ? 'voice-unlock-glow' : '',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2"><Phone size={15} /> Voice Call</span>
                      <span className={voiceUnlocked ? 'text-[11px] text-white/90' : 'text-[11px]'}>
                        {voiceUnlocked ? 'Available' : 'Locked'}
                      </span>
                    </button>
                    <button
                      onClick={() => videoUnlocked && startCall('video')}
                      disabled={!videoUnlocked}
                      className={[
                        'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                        videoUnlocked
                          ? 'border-[#4A3B32] bg-[#4A3B32] text-white'
                          : 'cursor-not-allowed border-[#D4A574]/30 bg-white text-[#4A3B32]/40',
                        showVideoUnlockGlow ? 'voice-unlock-glow' : '',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2"><Video size={15} /> Video Call</span>
                      <span className={videoUnlocked ? 'text-[11px] text-white/90' : 'text-[11px]'}>
                        {videoUnlocked ? 'Available' : 'Locked'}
                      </span>
                    </button>
                    {profileRevealed && (
                      <div className="flex items-center gap-2 rounded-lg bg-[#D4A574]/15 border border-[#D4A574]/30 px-3 py-2 text-[#4A3B32]">
                        <Eye size={15} />
                        <span className="text-sm">Profile Revealed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ALL MATCHES */}
            {allMatches.length > 0 && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-wider text-[#D4A574] mb-4">Past Matches</h2>
                <div className="flex flex-col gap-3">
                  {allMatches.map((m) => {
                    const mUnlock = m.unlock_level ?? 0;
                    return (
                      <div
                        key={m.id}
                        className="bg-white rounded-2xl border border-[#D4A574]/30 p-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow"
                        onClick={() => navigate(`${APP_ROUTES.chat}?matchId=${m.id}&unlockLevel=${mUnlock}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#D4A574]/30 to-[#4A3B32]/20 rounded-full flex items-center justify-center">
                            <span className="text-lg text-[#4A3B32]/50">
                              {m.partner_name?.charAt(0) ?? '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#4A3B32]">{m.partner_name}{m.partner_age ? `, ${m.partner_age}` : ''}</p>
                            <p className="text-xs text-[#4A3B32]/50">
                              {m.status === 'connected' ? 'Connected' : `Level ${mUnlock}`}
                              {m.compatibility_score != null && ` · ${m.compatibility_score}% match`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-[#D4A574]" />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl text-[#4A3B32] mb-3">
                {isPaused ? 'Matches Paused' : 'No Matches Yet'}
              </h1>
              <p className="text-[#4A3B32]/60">
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
        <div className="fixed inset-0 bg-[#4A3B32]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center">
            <div className="w-20 h-20 bg-[#4A3B32] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              {ringingMode === 'video' ? <Video size={36} className="text-white" /> : <Phone size={36} className="text-white" />}
            </div>
            <h2 className="text-2xl text-[#4A3B32] mb-2">Calling {match?.partner_name}...</h2>
            <p className="text-[#4A3B32]/60 mb-6">Waiting for them to pick up</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Loader2 size={16} className="animate-spin text-[#D4A574]" />
              <span className="text-sm text-[#4A3B32]/60">Ringing</span>
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
        <div className="fixed inset-0 bg-[#4A3B32]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              {incomingInvite.mode === 'video' ? <Video size={36} className="text-white" /> : <Phone size={36} className="text-white" />}
            </div>
            <h2 className="text-2xl text-[#4A3B32] mb-2">Incoming {incomingInvite.mode === 'video' ? 'Video' : 'Voice'} Call</h2>
            <p className="text-[#4A3B32]/60 mb-8">{match?.partner_name} is calling you</p>
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
