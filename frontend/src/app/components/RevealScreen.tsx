import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Heart, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { matchProfile } from '../../lib/mock-data';
import { Button } from '../../components/Button';

export function RevealScreen() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
          <div className="flex flex-col gap-8">
            <button
              onClick={() => navigate(APP_ROUTES.match)}
              className="self-start text-neutral-600 hover:text-black"
            >
              <X size={24} />
            </button>

            <div className="bg-neutral-50 rounded-3xl overflow-hidden border-2 border-neutral-200">
              <div className="relative aspect-[3/4] bg-neutral-900 group">
                <img
                  src={matchProfile.photos[currentPhotoIndex].url}
                  alt={`Profile picture ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
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

                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-white text-lg font-medium leading-snug drop-shadow-md">
                    {matchProfile.photos[currentPhotoIndex].caption}
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 px-4">
                  {matchProfile.photos.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl mb-1">{matchProfile.name}, {matchProfile.age}</h2>
                  <p className="text-neutral-600">{matchProfile.location}</p>
                </div>

                <p className="text-neutral-700 mb-6 leading-relaxed">
                  {matchProfile.bio}
                </p>

                <div className="mb-8">
                  <h3 className="text-sm text-neutral-600 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchProfile.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-4 py-2 bg-white border border-neutral-300 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(APP_ROUTES.connection)}
                    className="flex-1 bg-[#4A3B32] text-white py-4 px-6 rounded-full hover:bg-[#322822] transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    Schedule Meeting
                  </button>
                  <button
                    onClick={() => navigate(APP_ROUTES.match)}
                    className="flex-1 border-2 border-[#4A3B32] text-[#4A3B32] py-4 px-6 rounded-full hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}
