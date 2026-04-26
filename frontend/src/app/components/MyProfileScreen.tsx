import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { loadUserProfilePreferences } from '../../lib/profile-storage';

export function MyProfileScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSetup = searchParams.get('fromSetup') === 'true';
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const profile = useMemo(() => loadUserProfilePreferences(), []);
  const activePhoto = profile.photos[activePhotoIndex];

  const nextPhoto = () => {
    if (profile.photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = () => {
    if (profile.photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  };

  const profileSections = [
    {
      title: 'Basics',
      fields: [
        { label: 'Interested In', value: profile.interestedIn.join(', ') || 'Not set' },
        { label: 'Relationship Type', value: profile.relationshipType || 'Not set' },
        { label: 'Age Range', value: `${profile.ageRange[0]} - ${profile.ageRange[1]}` },
      ],
    },
    {
      title: 'Compatibility Questions',
      fields: [
        { label: 'Relationship Means', value: profile.relationshipMeaning.join(', ') || 'Not set' },
        { label: 'Time With Partner', value: profile.timeWithPartner.join(', ') || 'Not set' },
        { label: 'Conflict Style', value: profile.conflictStyle || 'Not set' },
        { label: 'Island Scenario', value: profile.islandScenario || 'Not set' },
        { label: 'Musical Instrument', value: profile.musicalInstrument || 'Not set' },
      ],
    },
    {
      title: 'Lifestyle',
      fields: [
        { label: 'Sexuality', value: profile.sexuality || 'Not set' },
        { label: 'Spending Habits', value: profile.spendingHabits || 'Not set' },
        { label: 'Debt', value: profile.hasDebt || 'Not set' },
        { label: 'Wants Kids', value: profile.wantsKids || 'Not set' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(APP_ROUTES.match)}
          className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-black"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {fromSetup && (
          <div className="mb-6 rounded-xl border border-[#E8C9A0] bg-[#fff7ed] px-4 py-3 text-sm text-[#6f4e37]">
            Profile created successfully. Here is how your profile looks now.
          </div>
        )}

        <h1 className="mb-6 text-3xl">Your Profile</h1>

        <div className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-[4/3] w-full bg-neutral-100">
            {activePhoto?.url ? (
              <>
                <img
                  src={activePhoto.url}
                  alt={`Profile photo ${activePhotoIndex + 1}`}
                  className="h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-white">
                  <p className="text-sm">{activePhoto.caption || 'Profile photo'}</p>
                </div>

                {profile.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/60"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/60"
                    >
                      <ChevronRight size={18} />
                    </button>

                    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-3 py-1">
                      {profile.photos.map((_, index) => (
                        <div
                          key={`photo-dot-${index}`}
                          className={`h-1.5 w-5 rounded-full ${index === activePhotoIndex ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-500">
                <UserCircle2 size={48} />
                <p className="text-sm">No profile photo uploaded yet</p>
              </div>
            )}
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-2xl border border-neutral-200 bg-[#faf7f3] p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.interests.length > 0 ? (
                  profile.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-neutral-500">Not set</span>
                )}
              </div>
            </div>

            {profileSections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-neutral-200 p-4">
                <h2 className="mb-3 text-base">{section.title}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map((item) => (
                    <div key={item.label} className="rounded-xl bg-neutral-50 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500">{item.label}</p>
                      <p className="mt-1 text-sm text-neutral-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate(`${APP_ROUTES.preferences}?mode=edit`)}
            className="rounded-full bg-[#4A3B32] px-6 py-3 text-white hover:bg-[#322822]"
          >
            Update Match Preferences
          </button>
          <button
            onClick={() => navigate(APP_ROUTES.match)}
            className="rounded-full border border-neutral-300 px-6 py-3 text-neutral-700 hover:bg-neutral-50"
          >
            Continue Matching
          </button>
        </div>
      </div>
    </div>
  );
}
