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
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="text-white mx-auto mb-6 animate-spin"
          />
          <h2 className="text-white text-2xl">Connecting…</h2>
        </div>
      </div>
    );
  }

  if (callState === "error") {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-red-400 text-2xl mb-2">Call Failed</h2>
          <p className="text-neutral-400 mb-8">{errorMsg}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-neutral-700 rounded-full text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Remote video (full screen) */}
      <div className="flex-1 relative">
        <div
          ref={remoteVideoRef}
          className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900"
        >
          {!partnerJoined && (
            <div className="w-full h-full flex items-center justify-center text-white text-center">
              <div>
                <div className="w-32 h-32 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">?</span>
                </div>
                <p className="text-neutral-400">
                  Waiting for partner…
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white z-10">
          {formatDuration(callDuration)}
        </div>

        {/* Local video (picture-in-picture) */}
        <div
          ref={localVideoRef}
          className="absolute top-8 right-8 w-32 h-40 bg-neutral-700 rounded-2xl overflow-hidden border-2 border-white/20 z-10"
        />
      </div>

      {/* Controls */}
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

          <button
            onClick={handleVideoToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isVideoOn
                ? "bg-neutral-700 hover:bg-neutral-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isVideoOn ? (
              <Video size={24} className="text-white" />
            ) : (
              <VideoOff size={24} className="text-white" />
            )}
          </button>
        </div>

        <p className="text-center text-white/60 mt-6 text-sm">
          Complete this call to reveal your match's profile
        </p>
      </div>
    </div>
  );
}
