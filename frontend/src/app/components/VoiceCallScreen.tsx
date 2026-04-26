import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Phone, Loader2 } from "lucide-react";
import { APP_ROUTES } from "../../lib/routes";
import { getAgoraToken } from "../../lib/api/agora-api";
import { FloatingHearts } from './FloatingHearts';
import {
  joinVoiceCall,
  leaveCall,
  toggleMute,
} from "../../lib/agora";

type CallState = "connecting" | "connected" | "error";

export function VoiceCallScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId") ?? "";
  const unlockLevel = parseInt(searchParams.get("unlockLevel") || "0");

  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<CallState>("connecting");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const interactionId = useRef<string | null>(null);

  // Join Agora channel on mount
  useEffect(() => {
    if (!matchId) {
      setCallState("error");
      setErrorMsg("Missing match ID");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const tokenData = await getAgoraToken(matchId, "voice");
        if (cancelled) return;

        interactionId.current = tokenData.interaction_id;

        await joinVoiceCall(
          tokenData.app_id,
          tokenData.channel,
          tokenData.token,
          tokenData.uid,
          {
            onUserJoined: () => setPartnerJoined(true),
            onUserLeft: () => setPartnerJoined(false),
          },
        );

        if (!cancelled) setCallState("connected");
      } catch (err) {
        if (!cancelled) {
          setCallState("error");
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to join call",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      leaveCall();
    };
  }, [matchId]);

  // Timer
  useEffect(() => {
    if (callState !== "connected") return;
    const timer = setInterval(() => setCallDuration((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMuteToggle = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    toggleMute(next);
  }, [isMuted]);

  const endCall = useCallback(async () => {
    await leaveCall();
    if (unlockLevel >= 4) {
      navigate(`${APP_ROUTES.connection}?matchId=${matchId}&callType=voice&unlockLevel=${unlockLevel}`);
    } else {
      navigate(
        `${APP_ROUTES.rating}?matchId=${matchId}&unlockLevel=${unlockLevel}&callType=voice`,
      );
    }
  }, [navigate, unlockLevel]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#4A3B32] via-[#5a4a3f] to-[#2a1f18] flex flex-col relative overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#D4A574]/20 to-transparent blur-3xl gradient-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-[#D4A574]/15 to-transparent blur-3xl gradient-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[10%] w-[25%] h-[25%] rounded-full bg-gradient-to-bl from-[#E8C9A0]/10 to-transparent blur-2xl gradient-blob" style={{ animationDelay: '3s' }} />

      {/* Floating hearts */}
      <FloatingHearts count={10} />

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center">
          {callState === "connecting" && (
            <>
              <Loader2
                size={48}
                className="text-white mx-auto mb-6 animate-spin"
              />
              <h2 className="text-white text-2xl mb-2">Connecting…</h2>
              <p className="text-white/50">Setting up your voice channel</p>
            </>
          )}

          {callState === "error" && (
            <>
              <h2 className="text-red-300 text-2xl mb-2">
                Call Failed
              </h2>
              <p className="text-white/60 mb-8">{errorMsg}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                Go Back
              </button>
            </>
          )}

          {callState === "connected" && (
            <>
              {/* Gradient ring around avatar */}
              <div className="w-36 h-36 rounded-full mx-auto mb-8 p-[3px] bg-gradient-to-br from-[#D4A574] via-[#E8C9A0] to-[#D4A574] animate-pulse">
                <div className="w-full h-full bg-[#4A3B32]/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Phone size={48} className="text-white" />
                </div>
              </div>

              <h2 className="text-white text-2xl mb-2">Voice Call</h2>
              <p className="text-[#D4A574] mb-4">
                {partnerJoined ? "Connected" : "Waiting for partner…"}
              </p>

              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white text-xl inline-block border border-white/10">
                {formatDuration(callDuration)}
              </div>
            </>
          )}
        </div>
      </div>

      {callState === "connected" && (
        <div className="p-8 relative z-10">
          <div className="max-w-md mx-auto">
            {/* Gradient divider */}
            <div className="h-px w-32 mx-auto mb-6 bg-gradient-to-r from-transparent via-[#D4A574]/50 to-transparent" />

            <div className="flex justify-center gap-6">
              <button
                onClick={handleMuteToggle}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? "bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/25"
                    : "bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/10"
                }`}
              >
                {isMuted ? (
                  <MicOff size={24} className="text-white" />
                ) : (
                  <Mic size={24} className="text-white" />
                )}
              </button>

              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
            </div>

            <p className="text-center text-[#D4A574]/70 mt-6 text-sm">
              Complete this call to unlock video calling
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
