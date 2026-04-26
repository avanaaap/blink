import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Camera } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';

export function VideoCallScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    if (unlockLevel >= 4) {
      navigate(`${APP_ROUTES.connection}?callType=video&unlockLevel=${unlockLevel}`);
    } else {
      navigate(`${APP_ROUTES.rating}?unlockLevel=${unlockLevel}&callType=video`);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
          {isVideoOn ? (
            <div className="text-white text-center">
              <Camera size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-neutral-400">Video feed would appear here</p>
            </div>
          ) : (
            <div className="text-white text-center">
              <div className="w-32 h-32 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">?</span>
              </div>
              <p className="text-neutral-400">Camera is off</p>
            </div>
          )}
        </div>

        <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white">
          {formatDuration(callDuration)}
        </div>

        <div className="absolute top-8 right-8 w-32 h-40 bg-neutral-700 rounded-2xl overflow-hidden border-2 border-white/20">
          <div className="w-full h-full flex items-center justify-center text-white">
            <Camera size={32} className="opacity-50" />
          </div>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-md mx-auto flex justify-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
          >
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
          </button>

          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
          >
            <PhoneOff size={24} className="text-white" />
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isVideoOn ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isVideoOn ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
          </button>
        </div>

        <p className="text-center text-white/60 mt-6 text-sm">
          Complete this call to reveal your match's profile
        </p>
      </div>
    </div>
  );
}
