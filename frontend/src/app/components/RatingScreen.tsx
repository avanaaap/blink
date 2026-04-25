import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';

export function RatingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const optedOut = searchParams.get('optedOut') === 'true';
  const callType = searchParams.get('callType') || 'chat';
  const unlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [totalRating, setTotalRating] = useState(72);
  const handleSubmit = () => {
    const newTotal = totalRating + (rating * 5);
    setTotalRating(newTotal);

    let newUnlockLevel = unlockLevel;
    if (rating >= 4 && unlockLevel < 3) {
      newUnlockLevel = unlockLevel + 1;
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
              : 'Your rating helps us understand your preferences better'}
          </p>
        </div>

        <div className="bg-neutral-50 rounded-3xl p-8 border-2 border-neutral-200 mb-8">
          <div className="mb-8">
            <label className="block text-center text-sm mb-4 text-neutral-700">Rate this conversation</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={48}
                    fill={(hoveredRating || rating) >= star ? '#D4A574' : 'none'}
                    stroke={(hoveredRating || rating) >= star ? '#D4A574' : '#a3a3a3'}
                    strokeWidth={2}
                  />
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
            <span className="text-sm text-neutral-600">Rating Progress</span>
            <span className="text-sm">{totalRating}/100</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-neutral-400 to-black h-3 rounded-full transition-all"
              style={{ width: `${totalRating}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Complete the Video Call to unlock profile photos
          </p>

          {rating >= 4 && unlockLevel < 3 && (
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

        <Button onClick={handleSubmit} disabled={rating === 0} fullWidth>
          Submit Rating
        </Button>
      </div>
    </div>
  );
}
