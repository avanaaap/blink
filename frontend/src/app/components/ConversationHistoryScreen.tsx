import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';

interface ConversationSnapshot {
  id: string;
  endedAt: string;
  title: string;
  messages: Array<{ sender: 'me' | 'them'; text: string; timestamp: string }>;
}

const HISTORY_STORAGE_KEY = 'blink.conversationHistory';

function readHistory(): ConversationSnapshot[] {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ConversationSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ConversationHistoryScreen() {
  const navigate = useNavigate();

  const history = useMemo(() => readHistory(), []);

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <button
          onClick={() => navigate(APP_ROUTES.match)}
          className="mb-8 flex items-center gap-2 text-neutral-600 hover:text-black"
        >
          <ChevronLeft size={20} />
          Back to Matches
        </button>

        <div className="mb-8">
          <h1 className="text-4xl">Conversation History</h1>
          <p className="mt-2 text-neutral-600">Read-only transcript of your previous conversations</p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <MessageSquare className="mx-auto mb-3 text-neutral-500" size={28} />
            <p className="text-neutral-700">No past conversations yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((conversation) => (
              <div key={conversation.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg">{conversation.title}</h2>
                  <span className="text-xs text-neutral-500">{conversation.endedAt}</span>
                </div>

                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl bg-neutral-50 p-3">
                  {conversation.messages.length === 0 ? (
                    <p className="text-sm text-neutral-500">No messages captured in this conversation.</p>
                  ) : (
                    conversation.messages.map((message, index) => (
                      <div key={`${conversation.id}-${index}`} className="text-sm">
                        <span className="font-medium text-neutral-800">
                          {message.sender === 'me' ? 'You' : 'Match'}:
                        </span>{' '}
                        <span className="text-neutral-700">{message.text}</span>{' '}
                        <span className="text-xs text-neutral-500">({message.timestamp})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
