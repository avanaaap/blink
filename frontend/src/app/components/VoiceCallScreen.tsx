import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Phone, Loader2 } from "lucide-react";
import { APP_ROUTES } from "../../lib/routes";
import { getAgoraToken } from "../../lib/api/agora-api";
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
    <div className="h-screen bg-gradient-to-br from-neutral-900 to-black flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {callState === "connecting" && (
            <>
              <Loader2
                size={48}
                className="text-white mx-auto mb-6 animate-spin"
              />
              <h2 className="text-white text-2xl mb-2">Connecting…</h2>
            </>
          )}

          {callState === "error" && (
            <>
              <h2 className="text-red-400 text-2xl mb-2">
                Call Failed
              </h2>
              <p className="text-neutral-400 mb-8">{errorMsg}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-neutral-700 rounded-full text-white"
              >
                Go Back
              </button>
            </>
          )}

          {callState === "connected" && (
            <>
              <div className="w-32 h-32 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Phone size={48} className="text-white" />
              </div>

              <h2 className="text-white text-2xl mb-2">Voice Call</h2>
              <p className="text-neutral-400 mb-2">
                {partnerJoined ? "Connected" : "Waiting for partner…"}
              </p>

              <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-white text-xl inline-block">
                {formatDuration(callDuration)}
              </div>
            </>
          )}
        </div>
      </div>

      {callState === "connected" && (
        <div className="p-8 bg-gradient-to-t from-black to-transparent">
          <div className="max-w-md mx-auto flex justify-center gap-6">
            <button
              onClick={handleMuteToggle}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-neutral-700 hover:bg-neutral-600"
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
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
          </div>

          <p className="text-center text-white/60 mt-6 text-sm">
            Complete this call to unlock video calling
          </p>
        </div>
      )}
    </div>
  );
}
