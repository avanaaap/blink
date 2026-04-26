import { useState } from 'react';

type ReportReason =
  | 'Inappropriate behavior'
  | 'Harassment'
  | 'Spam or scam'
  | 'Hate speech'
  | 'Underage concern'
  | 'Other';

interface ReportModalProps {
  isOpen: boolean;
  sourceLabel: string;
  onClose: () => void;
}

const reportReasons: ReportReason[] = [
  'Inappropriate behavior',
  'Harassment',
  'Spam or scam',
  'Hate speech',
  'Underage concern',
  'Other',
];

export function ReportModal({ isOpen, sourceLabel, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) {
      return;
    }
    setSubmitted(true);
  };

  const handleDone = () => {
    setSelectedReason(null);
    setDetails('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#4A3B32]/70 px-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-7 shadow-xl">
        {!submitted ? (
          <>
            <h2 className="text-2xl">Report Conversation</h2>
            <p className="mt-2 text-sm text-neutral-600">Source: {sourceLabel}</p>

            <div className="mt-6 flex flex-col gap-2">
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={[
                    'rounded-xl border px-4 py-3 text-left transition-colors',
                    selectedReason === reason
                      ? 'border-[#4A3B32] bg-[#4A3B32] text-white'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500',
                  ].join(' ')}
                >
                  {reason}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm text-neutral-700">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Share anything that would help us review this report"
              className="mt-2 w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 focus:border-[#4A3B32] focus:outline-none"
              rows={4}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-neutral-300 px-6 py-3 text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason}
                className="flex-1 rounded-full bg-[#4A3B32] px-6 py-3 text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                Submit Report
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl">Report Submitted</h2>
            <p className="mt-3 text-neutral-600">
              Thanks. We received your report and will review it promptly.
            </p>
            <button
              onClick={handleDone}
              className="mt-6 w-full rounded-full bg-[#4A3B32] px-6 py-3 text-white"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
