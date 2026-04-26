import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { ReportModal } from '../../components/ReportModal';
import { submitStageDecision } from '../../lib/api/matching-api';
import type { StageDecisionChoice } from '../../lib/api/matching-api';

type ConversationDecision = 'no' | 'unsure' | 'yes';

const DECISION_MAP: Record<ConversationDecision, StageDecisionChoice> = {
  yes: 'move_forward',
  unsure: 'not_sure',
  no: 'dont_move_forward',
};

export function RatingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId') || '';
  const optedOut = searchParams.get('optedOut') === 'true';
  const callType = searchParams.get('callType') || 'chat';
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [decision, setDecision] = useState<ConversationDecision | null>(optedOut ? 'no' : null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSubmit = async () => {
    if (!decision || !matchId) return;

    setSubmitting(true);
    try {
      const result = await submitStageDecision(matchId, DECISION_MAP[decision]);

      if (result.status === 'unmatched') {
        navigate(APP_ROUTES.match);
      } else if (result.status === 'advanced') {
        if (result.unlock_level >= 4) {
          navigate(APP_ROUTES.reveal);
        } else {
          navigate(APP_ROUTES.match);
        }
      } else {
        // "waiting" — other user hasn't decided yet
        navigate(APP_ROUTES.match);
      }
    } catch (e) {
      console.error('Failed to submit decision:', e);
      // Fallback: navigate back to match
      navigate(APP_ROUTES.match);
    } finally {
      setSubmitting(false);
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

        <Button onClick={handleSubmit} disabled={decision === null || submitting} fullWidth>
          {submitting ? 'Submitting...' : 'Continue'}
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
