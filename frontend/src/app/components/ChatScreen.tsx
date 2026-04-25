import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, X, Clock, Phone, Video } from 'lucide-react';
import { UnlockProgressBar } from './UnlockProgressBar';
import { APP_ROUTES } from '../../lib/routes';
import { starterQuestions } from '../../lib/mock-data';

type MessageType = {
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
};

export function ChatScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(unlockLevel >= 4 ? Infinity : 3600);
  const [timerState, setTimerState] = useState<'center' | 'moving' | 'top'>('center');
  const [showOptOut, setShowOptOut] = useState(false);
  const [showUnlockProgress, setShowUnlockProgress] = useState(true);
  const [reminder, setReminder] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveTimer = setTimeout(() => {
      setTimerState('moving');
      const hideOverlay = setTimeout(() => {
        setTimerState('top');
      }, 500);
      return () => clearTimeout(hideOverlay);
    }, 1000);
    return () => clearTimeout(moveTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === 301) setReminder("5 minutes remaining");
        else if (prev === 61) setReminder("1 minute remaining");
        else if (prev === 31) setReminder("30 seconds remaining");

        if (prev <= 0) {
          clearInterval(timer);
          navigate(`${APP_ROUTES.rating}?unlockLevel=${unlockLevel}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, unlockLevel]);

  useEffect(() => {
    if (reminder) {
      const toastTimer = setTimeout(() => setReminder(null), 4000);
      return () => clearTimeout(toastTimer);
    }
  }, [reminder]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages([...messages, { text: inputValue, sender: 'me', timestamp: now }]);
    setInputValue('');

    setTimeout(() => {
      const responses = [
        "That's really interesting! Tell me more about that.",
        "I love that perspective! I've never thought of it that way.",
        "Absolutely! I can relate to that so much.",
        "That sounds amazing! What drew you to that?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { text: randomResponse, sender: 'them', timestamp: responseTime }]);
    }, 2000);
  };

  const startVoiceCall = () => {
    if (unlockLevel < 1) return;
    navigate(`${APP_ROUTES.voiceCall}?unlockLevel=${unlockLevel}`);
  };

  const startVideoCall = () => {
    if (unlockLevel < 2) return;
    navigate(`${APP_ROUTES.videoCall}?unlockLevel=${unlockLevel}`);
  };

  const handleOptOut = () => {
    navigate(`${APP_ROUTES.rating}?optedOut=true&unlockLevel=${unlockLevel}`);
  };

  return (
    <div className="h-screen bg-white flex flex-col relative overflow-hidden">
      {timerState !== 'top' && (
        <div className={`absolute inset-0 z-50 transition-opacity duration-500 ${timerState === 'moving' ? 'bg-transparent pointer-events-none' : 'bg-white/90'}`}>
          <div 
            className="fixed font-bold transition-all duration-500 ease-in-out whitespace-nowrap"
            style={{ 
              color: '#4A3B32',
              top: timerState === 'moving' ? '24px' : '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: timerState === 'moving' ? '0.875rem' : '6rem'
            }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      )}

      {reminder && (
        <div className="absolute top-20 left-1/2 z-40 -translate-x-1/2 rounded-full border-2 border-[#4A3B32] bg-white px-6 py-3 text-[#4A3B32] shadow-lg transition-all">
          <p className="font-bold">{reminder}</p>
        </div>
      )}

      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowOptOut(true)}
            className="flex items-center gap-2 text-neutral-600 hover:text-black"
          >
            <ArrowLeft size={20} />
          </button>

          <div className={`flex items-center gap-2 text-neutral-700 transition-opacity duration-300 ${timerState === 'top' ? 'opacity-100' : 'opacity-0'}`}>
            <Clock size={18} />
            <span className="text-sm">{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowOptOut(true)}
            className="text-neutral-600 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-4">
        {showUnlockProgress && (
          <div className="mb-4">
            <UnlockProgressBar unlockLevel={unlockLevel} />
          </div>
        )}

        {messages.length === 0 && (
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
            <h3 className="text-lg mb-4">Conversation Starters</h3>
            <div className="flex flex-col gap-2">
              {starterQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(question)}
                  className="text-left px-4 py-3 bg-white border border-neutral-300 rounded-lg hover:border-black transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex mb-4 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-[#4A3B32] text-white'
                      : 'bg-neutral-100 text-black'
                  }`}
                >
                  <span>{message.text}</span>
                </div>
                <span className="text-xs text-neutral-500 px-2">{message.timestamp}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-neutral-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {!showOptOut && (unlockLevel >= 1 || unlockLevel >= 2) && (
            <div className="flex gap-2 mb-3 justify-center">
              {unlockLevel >= 1 && (
                <button
                  onClick={startVoiceCall}
                  className="px-6 py-3 rounded-full border-2 border-black hover:bg-neutral-50 transition-colors flex items-center gap-2"
                >
                  <Phone size={18} />
                  Voice Call
                </button>
              )}
              {unlockLevel >= 2 && (
                <button
                  onClick={startVideoCall}
                  className="flex items-center gap-2 rounded-full bg-[#D4A574] px-6 py-3 text-white transition-opacity hover:opacity-90"
                >
                  <Video size={18} />
                  Video Call
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-full focus:outline-none focus:border-black"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="bg-[#4A3B32] text-white p-3 rounded-full hover:bg-[#322822] transition-colors disabled:bg-neutral-300"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {showOptOut && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl mb-4">End Conversation?</h2>
            <p className="text-neutral-600 mb-6">
              Opting out will result in a negative rating and affect future matches.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleOptOut}
                className="bg-[#4A3B32] text-white py-3 px-6 rounded-full hover:bg-[#322822] transition-colors"
              >
                Yes, End Now
              </button>
              <button
                onClick={() => setShowOptOut(false)}
                className="border-2 border-neutral-300 py-3 px-6 rounded-full hover:bg-neutral-50 transition-colors"
              >
                Continue Chatting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
