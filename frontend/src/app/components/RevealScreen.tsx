import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Heart, X, ChevronLeft, ChevronRight, Calendar, Flag } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { matchProfile } from '../../lib/mock-data';
import { Button } from '../../components/Button';
import { ReportModal } from '../../components/ReportModal';

export function RevealScreen() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % matchProfile.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + matchProfile.photos.length) % matchProfile.photos.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {!showProfile ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <BlinkLogo size={100} className="text-black animate-pulse" />
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
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(APP_ROUTES.match)}
                className="text-neutral-600 hover:text-black"
              >
                <X size={24} />
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-neutral-600 hover:text-black"
                aria-label="Report from profile screen"
              >
                <Flag size={20} />
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] bg-neutral-900">
                <img
                  src={matchProfile.photos[currentPhotoIndex].url}
                  alt={`Profile picture ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button 
                    onClick={prevPhoto}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextPhoto}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3">
                  <p className="text-sm text-white">
                    {matchProfile.photos[currentPhotoIndex].caption}
                  </p>
                </div>

                <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-3 py-1">
                  {matchProfile.photos.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 w-5 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div className="rounded-2xl border border-neutral-200 bg-[#faf7f3] p-4">
                  <h2 className="text-2xl">{matchProfile.name}, {matchProfile.age}</h2>
                  <p className="mt-1 text-sm text-neutral-600">{matchProfile.location}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-4">
                  <h3 className="mb-2 text-base">About</h3>
                  <p className="text-sm leading-relaxed text-neutral-700">{matchProfile.bio}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-4">
                  <h3 className="mb-3 text-base">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchProfile.interests.map(interest => (
                      <span
                        key={interest}
                        className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => navigate(APP_ROUTES.connection)}
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
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        sourceLabel="From profile screen"
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
