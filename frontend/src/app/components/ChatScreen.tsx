import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, X, Clock, Phone, Video, Flag } from 'lucide-react';
import { UnlockProgressBar } from './UnlockProgressBar';
import { APP_ROUTES } from '../../lib/routes';
import { ReportModal } from '../../components/ReportModal';
import { getConversation, sendConversationMessage, sendTypingSignal, getTypingStatus } from '../../lib/api/chat-api';

const starterQuestions = [
  "What's something you're really passionate about right now?",
  "If you could travel anywhere tomorrow, where would you go?",
  "What's the best thing that happened to you this week?",
];

type MessageType = {
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
};

const TIMER_STORAGE_KEY_PREFIX = 'blink.chatTimerEndMs';

export function ChatScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId') || '';
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [inputValue, setInputValue] = useState('');
  const timerStorageKey = `${TIMER_STORAGE_KEY_PREFIX}.${unlockLevel}`;
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (unlockLevel >= 4) return Infinity;

    const existingEndMs = localStorage.getItem(timerStorageKey);
    if (existingEndMs) {
      const remaining = Math.max(0, Math.ceil((Number(existingEndMs) - Date.now()) / 1000));
      return remaining;
    }

    const endMs = Date.now() + 3600 * 1000;
    localStorage.setItem(timerStorageKey, String(endMs));
    return 3600;
  });
  const [timerState, setTimerState] = useState<'center' | 'moving' | 'top'>('center');
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showUnlockProgress, setShowUnlockProgress] = useState(true);
  const [reminder, setReminder] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const voiceUnlocked = unlockLevel >= 1;
  const videoUnlocked = unlockLevel >= 2;


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
    if (unlockLevel >= 4) {
      return;
    }

    const timer = setInterval(() => {
      const endMs = Number(localStorage.getItem(timerStorageKey) || 0);
      const remaining = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));

      if (remaining === 300) setReminder('5 minutes remaining');
      else if (remaining === 60) setReminder('1 minute remaining');
      else if (remaining === 30) setReminder('30 seconds remaining');

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        localStorage.removeItem(timerStorageKey);
        navigate(`${APP_ROUTES.rating}?matchId=${matchId}&unlockLevel=${unlockLevel}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, unlockLevel, timerStorageKey]);

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

  const loadMessages = useCallback(async () => {
    if (!matchId) return;
    try {
      const msgs = await getConversation(matchId);
      setMessages(
        msgs.map((m) => ({
          text: m.text,
          sender: m.sender,
          timestamp: new Date(m.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })),
      );
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  }, [matchId]);

  // Load messages on mount and poll every 3 seconds for new ones
  useEffect(() => {
    void loadMessages();
    pollRef.current = setInterval(() => void loadMessages(), 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadMessages]);

  // Poll for partner typing status
  useEffect(() => {
    if (!matchId) return;
    const poll = async () => {
      const typing = await getTypingStatus(matchId);
      setPartnerTyping(typing);
    };
    typingPollRef.current = setInterval(poll, 2000);
    return () => {
      if (typingPollRef.current) clearInterval(typingPollRef.current);
    };
  }, [matchId]);

  // Send typing signal on input change (debounced)
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (!matchId || !value.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      void sendTypingSignal(matchId);
    }, 300);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !matchId) return;

    const text = inputValue.trim();
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    // Optimistic update
    setMessages((prev) => [...prev, { text, sender: 'me', timestamp: now }]);
    setInputValue('');

    try {
      await sendConversationMessage(matchId, text);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const startVoiceCall = () => {
    if (!voiceUnlocked) return;
    navigate(`${APP_ROUTES.voiceCall}?matchId=${matchId}&unlockLevel=${unlockLevel}`);
  };

  const startVideoCall = () => {
    if (!videoUnlocked) return;
    navigate(`${APP_ROUTES.videoCall}?matchId=${matchId}&unlockLevel=${unlockLevel}`);
  };

  const handleBack = () => {
    navigate(APP_ROUTES.match);
  };

  const handleEndConversation = () => {
    if (unlockLevel < 4) {
      localStorage.removeItem(timerStorageKey);
    }
    navigate(`${APP_ROUTES.rating}?matchId=${matchId}&optedOut=true&unlockLevel=${unlockLevel}`);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#faf7f3] to-white flex flex-col relative overflow-hidden">
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
            onClick={handleBack}
            className="flex items-center gap-2 text-[#4A3B32]/70 hover:text-[#4A3B32]"
            aria-label="Back to conversation history"
          >
            <ArrowLeft size={20} />
          </button>

          <div className={`flex items-center gap-2 text-neutral-700 transition-opacity duration-300 ${timerState === 'top' ? 'opacity-100' : 'opacity-0'}`}>
            <Clock size={18} />
            <span className="text-sm">{formatTime(timeRemaining)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-[#4A3B32]/70 hover:text-[#4A3B32]"
              aria-label="Report conversation"
            >
              <Flag size={20} />
            </button>
            <button
              onClick={() => setShowEndConfirmation(true)}
              className="text-[#4A3B32]/70 hover:text-[#4A3B32]"
              aria-label="End conversation"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-4">
        {showUnlockProgress && (
          <div className="mb-4">
            <UnlockProgressBar unlockLevel={unlockLevel} />
          </div>
        )}

        {messages.length === 0 && (
          <div className="bg-gradient-to-br from-[#faf7f3] to-white rounded-2xl p-6 border border-[#D4A574]/20 shadow-sm">
            <h3 className="text-lg mb-4">Conversation Starters</h3>
            <div className="flex flex-col gap-2">
              {starterQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(question)}
                  className="text-left px-4 py-3 bg-white border border-neutral-300 rounded-lg hover:border-[#4A3B32] transition-colors"
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
                      ? 'bg-gradient-to-br from-[#4A3B32] to-[#322822] text-white shadow-sm'
                      : 'bg-gradient-to-br from-[#D4A574]/15 to-[#E8C9A0]/10 text-[#4A3B32]'
                  }`}
                >
                  <span>{message.text}</span>
                </div>
                <span className="text-xs text-neutral-500 px-2">{message.timestamp}</span>
              </div>
            </div>
          ))}
          {partnerTyping && (
            <div className="flex mb-4 justify-start">
              <div className="px-4 py-3 rounded-2xl bg-[#D4A574]/15">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#4A3B32]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#4A3B32]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#4A3B32]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-neutral-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <button
              onClick={startVoiceCall}
              disabled={!voiceUnlocked}
              className={[
                'flex items-center justify-center gap-2 rounded-full border px-4 py-3 transition-colors',
                voiceUnlocked
                  ? 'border-[#4A3B32] text-[#4A3B32] hover:bg-neutral-50'
                  : 'cursor-not-allowed border-neutral-300 text-neutral-500',
              ].join(' ')}
            >
              <Phone size={18} />
              {voiceUnlocked ? 'Start Voice Call' : 'Voice Locked'}
            </button>
            <button
              onClick={startVideoCall}
              disabled={!videoUnlocked}
              className={[
                'flex items-center justify-center gap-2 rounded-full border px-4 py-3 transition-colors',
                videoUnlocked
                  ? 'border-[#4A3B32] text-[#4A3B32] hover:bg-neutral-50'
                  : 'cursor-not-allowed border-neutral-300 text-neutral-500',
              ].join(' ')}
            >
              <Video size={18} />
              {videoUnlocked ? 'Start Video Call' : 'Video Locked'}
            </button>
          </div>

          {(!voiceUnlocked || !videoUnlocked) && (
            <p className="mb-3 text-center text-xs text-neutral-500">
              Unlock voice after a successful text chat, then unlock video after a successful voice call.
            </p>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-full focus:outline-none focus:border-[#4A3B32]"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-br from-[#4A3B32] to-[#322822] text-white p-3 rounded-full hover:from-[#322822] hover:to-[#2a1f18] transition-all disabled:bg-neutral-300 disabled:from-neutral-300 disabled:to-neutral-300 shadow-sm"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {showEndConfirmation && (
        <div className="fixed inset-0 z-[70] bg-[#4A3B32]/70 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl mb-4">End Conversation?</h2>
            <p className="text-neutral-600 mb-6">
              This ends the current chat and sends your response to matching.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleEndConversation}
                className="bg-[#4A3B32] text-white py-3 px-6 rounded-full hover:bg-[#322822] transition-colors"
              >
                Yes, End Now
              </button>
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="border-2 border-neutral-300 py-3 px-6 rounded-full hover:bg-neutral-50 transition-colors"
              >
                Continue Chatting
              </button>
              <button
                onClick={() => {
                  setShowEndConfirmation(false);
                  setShowReportModal(true);
                }}
                className="text-sm text-neutral-600 underline underline-offset-4"
              >
                Report instead
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        sourceLabel="During conversation"
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
