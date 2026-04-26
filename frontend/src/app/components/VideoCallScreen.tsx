import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Loader2,
} from "lucide-react";
import { APP_ROUTES } from "../../lib/routes";
import { getAgoraToken } from "../../lib/api/agora-api";
import { FloatingHearts } from './FloatingHearts';
import {
  joinVideoCall,
  leaveCall,
  toggleMute,
  toggleVideo,
} from "../../lib/agora";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

type CallState = "connecting" | "connected" | "error";

export function VideoCallScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId") ?? "";
  const unlockLevel = parseInt(searchParams.get("unlockLevel") || "0");

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<CallState>("connecting");
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
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
        const tokenData = await getAgoraToken(matchId, "video");
        if (cancelled) return;

        interactionId.current = tokenData.interaction_id;

        const { videoTrack } = await joinVideoCall(
          tokenData.app_id,
          tokenData.channel,
          tokenData.token,
          tokenData.uid,
          {
            onUserJoined: () => setPartnerJoined(true),
            onUserLeft: () => {
              setPartnerJoined(false);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.innerHTML = "";
              }
            },
            onRemoteVideoReady: (
              user: IAgoraRTCRemoteUser,
            ) => {
              if (remoteVideoRef.current && user.videoTrack) {
                user.videoTrack.play(remoteVideoRef.current);
              }
            },
          },
        );

        if (!cancelled) {
          setCallState("connected");
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
        }
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

  const handleVideoToggle = useCallback(() => {
    const next = !isVideoOn;
    setIsVideoOn(next);
    toggleVideo(next);
  }, [isVideoOn]);

  const endCall = useCallback(async () => {
    await leaveCall();
    if (unlockLevel >= 4) {
      navigate(`${APP_ROUTES.connection}?matchId=${matchId}&callType=video&unlockLevel=${unlockLevel}`);
    } else {
      navigate(
        `${APP_ROUTES.rating}?matchId=${matchId}&unlockLevel=${unlockLevel}&callType=video`,
      );
    }
  }, [navigate, unlockLevel]);

  if (callState === "connecting") {
    return (
      <div className="h-screen bg-gradient-to-br from-[#4A3B32] via-[#5a4a3f] to-[#2a1f18] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#D4A574]/20 to-transparent blur-3xl gradient-blob" />
        <FloatingHearts count={6} />
        <div className="text-center relative z-10">
          <Loader2
            size={48}
            className="text-white mx-auto mb-6 animate-spin"
          />
          <h2 className="text-white text-2xl mb-2">Connecting…</h2>
          <p className="text-white/50">Setting up your video channel</p>
        </div>
      </div>
    );
  }

  if (callState === "error") {
    return (
      <div className="h-screen bg-gradient-to-br from-[#4A3B32] via-[#5a4a3f] to-[#2a1f18] flex items-center justify-center relative overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-[#D4A574]/15 to-transparent blur-3xl gradient-blob" />
        <div className="text-center relative z-10">
          <h2 className="text-red-300 text-2xl mb-2">Call Failed</h2>
          <p className="text-white/60 mb-8">{errorMsg}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#4A3B32] to-[#2a1f18] flex flex-col relative overflow-hidden">
      {/* Remote video (full screen) */}
      <div className="flex-1 relative">
        <div
          ref={remoteVideoRef}
          className="absolute inset-0 bg-gradient-to-br from-[#4A3B32]/80 to-[#2a1f18]"
        >
          {!partnerJoined && (
            <div className="w-full h-full flex items-center justify-center text-white text-center relative">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#D4A574]/15 to-transparent blur-3xl gradient-blob" />
              <FloatingHearts count={8} />
              <div className="relative z-10">
                <div className="w-36 h-36 rounded-full mx-auto mb-4 p-[3px] bg-gradient-to-br from-[#D4A574] via-[#E8C9A0] to-[#D4A574] animate-pulse">
                  <div className="w-full h-full bg-[#4A3B32]/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-5xl">?</span>
                  </div>
                </div>
                <p className="text-[#D4A574]">
                  Waiting for partner…
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="absolute top-8 left-8 bg-[#4A3B32]/60 backdrop-blur-md px-4 py-2 rounded-full text-white z-10 border border-[#D4A574]/20">
          {formatDuration(callDuration)}
        </div>

        {/* Local video (picture-in-picture) */}
        <div
          ref={localVideoRef}
          className="absolute top-8 right-8 w-32 h-40 bg-[#4A3B32]/60 rounded-2xl overflow-hidden border-2 border-[#D4A574]/30 z-10 shadow-lg"
        />
      </div>

      {/* Controls */}
      <div className="p-8 bg-gradient-to-t from-[#2a1f18] via-[#2a1f18]/80 to-transparent relative z-10">
        {/* Gradient divider */}
        <div className="h-px w-32 mx-auto mb-6 bg-gradient-to-r from-transparent via-[#D4A574]/50 to-transparent" />

        <div className="max-w-md mx-auto flex justify-center gap-6">
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

          <button
            onClick={handleVideoToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isVideoOn
                ? "bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/10"
                : "bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/25"
            }`}
          >
            {isVideoOn ? (
              <Video size={24} className="text-white" />
            ) : (
              <VideoOff size={24} className="text-white" />
            )}
          </button>
        </div>

        <p className="text-center text-[#D4A574]/70 mt-6 text-sm">
          Complete this call to reveal your match's profile
        </p>
      </div>
    </div>
  );
}
