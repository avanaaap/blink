import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { ReportModal } from '../../components/ReportModal';

type ConversationDecision = 'no' | 'unsure' | 'yes';

export function RatingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const optedOut = searchParams.get('optedOut') === 'true';
  const callType = searchParams.get('callType') || 'chat';
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [decision, setDecision] = useState<ConversationDecision | null>(optedOut ? 'no' : null);
  const [feedback, setFeedback] = useState('');
  const [progressScore, setProgressScore] = useState(72);
  const [showReportModal, setShowReportModal] = useState(false);

  const decisionScore = decision === 'yes' ? 5 : decision === 'unsure' ? 3 : decision === 'no' ? 1 : 0;

  const handleSubmit = () => {
    if (!decision) {
      return;
    }

    const newTotal = progressScore + (decisionScore * 5);
    setProgressScore(newTotal);

    let newUnlockLevel = unlockLevel;
    if (decision === 'yes') {
      if (callType === 'chat' && unlockLevel < 1) {
        newUnlockLevel = 1;
      } else if (callType === 'voice' && unlockLevel < 2) {
        newUnlockLevel = 2;
      } else if (callType === 'video' && unlockLevel < 3) {
        newUnlockLevel = 3;
      }
    }

    if (newTotal >= 80 && newUnlockLevel === 3) {
      navigate(APP_ROUTES.reveal);
    } else {
      navigate(`${APP_ROUTES.match}?unlockLevel=${newUnlockLevel}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-3">
            {optedOut
              ? `${callType === 'voice' ? 'Call' : 'Conversation'} Ended Early`
              : callType === 'voice'
              ? 'How Was Your Voice Call?'
              : callType === 'video'
              ? 'How Was Your Video Call?'
              : 'How Was Your Conversation?'}
          </h1>
          <p className="text-neutral-600">
            {optedOut
              ? 'Your feedback helps us improve future matches'
              : 'Your response helps us understand your preferences better'}
          </p>
          <button
            onClick={() => setShowReportModal(true)}
            className="mt-3 text-sm text-neutral-600 underline underline-offset-4 hover:text-black"
          >
            Report this conversation
          </button>
        </div>

        <div className="bg-neutral-50 rounded-3xl p-8 border-2 border-neutral-200 mb-8">
          <div className="mb-8">
            <label className="block text-center text-sm mb-4 text-neutral-700">How do you feel about moving forward?</label>
            <div className="flex flex-col gap-3">
              {[
                { value: 'yes' as const, label: 'Move Forward' },
                { value: 'unsure' as const, label: 'Unsure' },
                { value: 'no' as const, label: "Don't Move Forward" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDecision(option.value)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                    decision === option.value
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-3 text-neutral-700">Additional feedback (optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                callType === 'voice'
                  ? 'How was the voice connection? How did you feel during the call?'
                  : callType === 'video'
                  ? 'How did you feel meeting face-to-face?'
                  : 'What did you enjoy? What could be better?'
              }
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-black resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Connection Progress</span>
            <span className="text-sm">{progressScore}/100</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-neutral-400 to-black h-3 rounded-full transition-all"
              style={{ width: `${progressScore}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Complete the Video Call to unlock profile photos
          </p>

          {decision === 'yes' && unlockLevel < 3 && (
            <div className="mt-4 p-4 rounded-lg text-center" style={{ backgroundColor: '#E8C9A0' }}>
              <p className="text-sm">
                Great conversation! You've unlocked:{' '}
                {unlockLevel === 0 && 'Voice Call'}
                {unlockLevel === 1 && 'Video Call'}
                {unlockLevel === 2 && 'Profile Reveal'}
              </p>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={decision === null} fullWidth>
          Continue
        </Button>
      </div>

      <ReportModal
        isOpen={showReportModal}
        sourceLabel="After conversation"
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
