import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { ArrowLeft, Send, X, MessageCircle, Phone, Video } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';

type MessageType = {
  text: string;
  sender: 'me' | 'them';
  time: string;
};

const HISTORY_STORAGE_KEY = 'blink.connectionTextHistory';

export function ConnectionScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>(() => {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as MessageType[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const matchProfile = {
    name: 'Alex',
    age: 28,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages([...messages, { text: inputValue, sender: 'me', time: now }]);
    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "That sounds like a great time. Let's do it!", 
        sender: 'them', 
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(APP_ROUTES.match)}
            className="flex items-center gap-2 text-neutral-600 hover:text-black"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <BlinkLogo size={44} className="text-black" />
          <button
            onClick={() => navigate(APP_ROUTES.match)}
            className="text-neutral-600 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-4xl mb-3">Text with {matchProfile.name}</h1>
          <p className="text-neutral-600 text-lg">
            You’re connected. Text, call, or video call from the same place with no time limit.
          </p>
        </div>

        <div className="w-full rounded-3xl border-2 border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg">{matchProfile.name}, {matchProfile.age}</h2>
                <p className="text-sm text-neutral-500">Unlimited connection hub</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs text-neutral-500 border border-neutral-200">
                Connected
              </div>
            </div>
          </div>

          <div className="border-b border-neutral-200 bg-white px-5 py-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                onClick={() => {}}
                className="flex items-center justify-center gap-2 rounded-full bg-[#4A3B32] px-4 py-3 text-white"
              >
                <MessageCircle size={16} />
                Text
              </button>
              <button
                onClick={() => navigate(`${APP_ROUTES.voiceCall}?unlockLevel=4`)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#4A3B32] px-4 py-3 text-[#4A3B32] hover:bg-neutral-50"
              >
                <Phone size={16} />
                Voice
              </button>
              <button
                onClick={() => navigate(`${APP_ROUTES.videoCall}?unlockLevel=4`)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#4A3B32] px-4 py-3 text-[#4A3B32] hover:bg-neutral-50"
              >
                <Video size={16} />
                Video
              </button>
            </div>
          </div>

          <div className="border-b border-neutral-200 bg-[#faf7f3] px-5 py-4">
            <p className="text-sm text-neutral-700">
              Previous text chat history
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Your messages stay here so you can revisit them anytime.
            </p>
          </div>

          <div className="h-[560px] overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-white">
            {messages.length === 0 && (
              <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
                Start texting to plan a time, then your full chat history will appear here.
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[75%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl ${msg.sender === 'me' ? 'bg-[#4A3B32] text-white' : 'bg-neutral-100 text-black'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-neutral-400 px-1 mt-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-neutral-200 bg-white p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-full focus:outline-none focus:border-black text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="bg-[#4A3B32] text-white p-3 rounded-full disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
