import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Heart, Calendar, Send, Phone, Video, X } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';

export function ConnectionScreen() {
  const navigate = useNavigate();
  const [isScheduling, setIsScheduling] = useState(false);
  const [messages, setMessages] = useState<{text: string, sender: 'me'|'them', time: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const matchProfile = {
    name: 'Alex',
    age: 28,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-8">
          <BlinkLogo size={80} className="text-black" />

          <div className="text-center">
            <h1 className="text-4xl mb-3">You're Connected!</h1>
            <p className="text-neutral-600 text-lg">
              You and {matchProfile.name} can now see each other's full profiles and schedule a time to meet
            </p>
          </div>

          <div className="w-full max-w-md bg-neutral-50 rounded-3xl p-8 border-2 border-neutral-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-neutral-300 to-neutral-400 rounded-full flex items-center justify-center">
                <Heart size={40} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl text-center mb-2">{matchProfile.name}, {matchProfile.age}</h2>
            <p className="text-center text-neutral-600 mb-8">Match</p>

            <div className="flex flex-col gap-3">
              {!isScheduling ? (
                <button 
                  onClick={() => setIsScheduling(true)}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-[#4A3B32] text-white rounded-xl hover:bg-[#322822] transition-colors"
                >
                  <Calendar size={20} />
                  <span className="font-medium">Schedule a Meeting</span>
                </button>
              ) : (
                <div className="flex flex-col h-[400px] border border-neutral-200 rounded-xl bg-white overflow-hidden">
                  <div className="p-3 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                    <span className="font-medium text-sm">Schedule with {matchProfile.name}</span>
                    <div className="flex gap-2 text-neutral-600">
                      <button onClick={() => navigate(`${APP_ROUTES.voiceCall}?unlockLevel=4`)} className="p-1 hover:text-black"><Phone size={18} /></button>
                      <button onClick={() => navigate(`${APP_ROUTES.videoCall}?unlockLevel=4`)} className="p-1 hover:text-black"><Video size={18} /></button>
                      <button onClick={() => setIsScheduling(false)} className="p-1 hover:text-black ml-2"><X size={18} /></button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.length === 0 && (
                      <div className="text-center text-sm text-neutral-500 mt-4">
                        No time limit. Text, voice, or video call to figure out a time to meet!
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className={`px-3 py-2 rounded-2xl ${msg.sender === 'me' ? 'bg-[#4A3B32] text-white' : 'bg-neutral-100 text-black'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-neutral-400 px-1 mt-1">{msg.time}</span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 border-t border-neutral-200 flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Suggest a time or place..."
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-full focus:outline-none focus:border-black text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputValue.trim()}
                      className="bg-[#4A3B32] text-white p-2 rounded-full disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-md">
            <Button onClick={() => navigate(APP_ROUTES.match)} fullWidth>
              Back to Dashboard
            </Button>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-600 max-w-md">
            <p className="mb-2">Your connection is now active</p>
            <p className="text-xs">
              Both profiles are fully visible. Schedule a meeting to continue exploring this connection in person with limitless communication!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
