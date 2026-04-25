import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';

export function VoiceCallScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [isMuted, setIsMuted] = useState(false);
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
      navigate(APP_ROUTES.connection);
    } else {
      navigate(`${APP_ROUTES.rating}?unlockLevel=${unlockLevel}&callType=voice`);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-900 to-black flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Phone size={48} className="text-white" />
          </div>

          <h2 className="text-white text-2xl mb-2">Voice Call</h2>
          <p className="text-neutral-400 mb-8">Connected</p>

          <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-white text-xl inline-block">
            {formatDuration(callDuration)}
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
        </div>

        <p className="text-center text-white/60 mt-6 text-sm">
          Complete this call to unlock video calling
        </p>
      </div>
    </div>
  );
}
