import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { X, ChevronLeft, ChevronRight, Calendar, Flag, Loader2 } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { ReportModal } from '../../components/ReportModal';
import { getPartnerReveal } from '../../lib/api/match-api';
import type { PartnerReveal } from '../../lib/api/match-api';

export function RevealScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId') || '';
  const [showProfile, setShowProfile] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [partner, setPartner] = useState<PartnerReveal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !showProfile) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPartnerReveal(matchId)
      .then((data) => {
        if (!cancelled) setPartner(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [matchId, showProfile]);

  const photos = partner?.photos ?? [];

  const nextPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {!showProfile ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <BlinkLogo size={100} className="text-[#4A3B32] animate-pulse" />
            <div className="text-center">
              <h1 className="text-5xl mb-4">Congratulations!</h1>
              <p className="text-xl text-neutral-600 mb-2">
                You've completed your video call
              </p>
              <p className="text-neutral-500">
                Your match's profile is now revealed
              </p>
            </div>

            <Button onClick={() => setShowProfile(true)} className="mt-8 px-12 text-lg">
              Reveal Profile
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
            <Loader2 size={48} className="animate-spin text-neutral-400" />
            <p className="text-neutral-600">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => navigate(APP_ROUTES.match)}>Back to Match</Button>
          </div>
        ) : partner ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(APP_ROUTES.match)}
                className="text-[#4A3B32]/70 hover:text-[#4A3B32]"
              >
                <X size={24} />
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-[#4A3B32]/70 hover:text-[#4A3B32]"
                aria-label="Report from profile screen"
              >
                <Flag size={20} />
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-sm">
              {photos.length > 0 ? (
                <div className="relative aspect-[4/3] bg-neutral-900">
                  <img
                    src={photos[currentPhotoIndex].url}
                    alt={`Profile picture ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {photos.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <button
                        onClick={prevPhoto}
                        className="w-10 h-10 rounded-full bg-[#4A3B32]/50 text-white flex items-center justify-center hover:bg-[#4A3B32]/75 backdrop-blur-sm transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="w-10 h-10 rounded-full bg-[#4A3B32]/50 text-white flex items-center justify-center hover:bg-[#4A3B32]/75 backdrop-blur-sm transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  )}

                  {photos[currentPhotoIndex].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#4A3B32]/70 px-4 py-3">
                      <p className="text-sm text-white">
                        {photos[currentPhotoIndex].caption}
                      </p>
                    </div>
                  )}

                  {photos.length > 1 && (
                    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5 rounded-full bg-[#4A3B32]/40 px-3 py-1">
                      {photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 w-5 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                  <p className="text-neutral-500">No photos uploaded yet</p>
                </div>
              )}

              <div className="space-y-4 p-6">
                <div className="rounded-2xl border border-neutral-200 bg-[#faf7f3] p-4">
                  <h2 className="text-2xl">{partner.name}{partner.age ? `, ${partner.age}` : ''}</h2>
                  {partner.compatibility_score != null && (
                    <p className="mt-1 text-sm text-neutral-600">{partner.compatibility_score}% compatibility</p>
                  )}
                </div>

                {partner.interests && (
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <h3 className="mb-3 text-base">Interests</h3>
                    <p className="text-sm text-neutral-700">{partner.interests}</p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => navigate(`${APP_ROUTES.connection}?matchId=${matchId}`)}
                    className="rounded-full bg-[#4A3B32] px-6 py-3 text-white transition-colors hover:bg-[#322822] flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    Schedule Meeting
                  </button>
                  <button
                    onClick={() => navigate(APP_ROUTES.match)}
                    className="rounded-full border border-[#4A3B32] px-6 py-3 text-[#4A3B32] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Keep Exploring
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ReportModal
        isOpen={showReportModal}
        sourceLabel="From profile screen"
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
