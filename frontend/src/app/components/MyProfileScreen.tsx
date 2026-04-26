import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { getMyProfile } from '../../lib/api/profile-api';
import { listMyPhotos } from '../../lib/api/photo-api';
import type { Photo } from '../../lib/api/photo-api';
import type { Profile } from '../../lib/types';

export function MyProfileScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSetup = searchParams.get('fromSetup') === 'true';
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyProfile(), listMyPhotos()])
      .then(([profileData, photosData]) => {
        if (!cancelled) {
          setProfile(profileData);
          setPhotos(photosData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  const activePhoto = photos[activePhotoIndex];

  const nextPhoto = () => {
    if (photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="text-red-500">{error ?? 'Profile not found'}</p>
        <button
          onClick={() => navigate(APP_ROUTES.match)}
          className="rounded-full border border-neutral-300 px-6 py-2 hover:bg-neutral-50"
        >
          Go Back
        </button>
      </div>
    );
  }

  const profileSections = [
    {
      title: 'Basics',
      fields: [
        { label: 'I Identify As', value: profile.gender || 'Not set' },
        { label: 'Interested In', value: profile.interested_in?.join(', ') || 'Not set' },
        { label: 'Relationship Type', value: profile.relationship_type || 'Not set' },
        { label: 'Age Range', value: `${profile.age_range_min ?? '?'} - ${profile.age_range_max ?? '?'}` },
      ],
    },
    {
      title: 'Compatibility Questions',
      fields: [
        { label: 'Relationship Means', value: profile.relationship_meaning || 'Not set' },
        { label: 'Time With Partner', value: profile.time_with_partner || 'Not set' },
        { label: 'Conflict Style', value: profile.conflict_style || 'Not set' },
        { label: 'Island Scenario', value: profile.island_scenario || 'Not set' },
        { label: 'Musical Instrument', value: profile.musical_instrument || 'Not set' },
      ],
    },
    {
      title: 'Lifestyle',
      fields: [
        { label: 'Sexuality', value: profile.sexuality || 'Not set' },
        { label: 'Spending Habits', value: profile.spending_habits || 'Not set' },
        { label: 'Debt', value: profile.has_debt || 'Not set' },
        { label: 'Wants Kids', value: profile.wants_kids || 'Not set' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(APP_ROUTES.match)}
          className="mb-6 flex items-center gap-2 text-[#4A3B32]/70 hover:text-[#4A3B32]"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {fromSetup && (
          <div className="mb-6 rounded-xl border border-[#E8C9A0] bg-[#fff7ed] px-4 py-3 text-sm text-[#6f4e37]">
            Profile created successfully. Here is how your profile looks now.
          </div>
        )}

        <h1 className="mb-1 text-3xl">{profile.name || 'Your Profile'}</h1>
        {profile.age > 0 && (
          <p className="mb-6 text-neutral-500">{profile.age} years old</p>
        )}

        <div className="overflow-hidden rounded-3xl border-2 border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-[4/3] w-full bg-neutral-100">
            {activePhoto?.url ? (
              <>
                <img
                  src={activePhoto.url}
                  alt={`Profile photo ${activePhotoIndex + 1}`}
                  className="h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#4A3B32]/70 px-4 py-3 text-white">
                  <p className="text-sm">{activePhoto.caption || 'Profile photo'}</p>
                </div>

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#4A3B32]/50 p-2 text-white hover:bg-[#4A3B32]/70"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#4A3B32]/50 p-2 text-white hover:bg-[#4A3B32]/70"
                    >
                      <ChevronRight size={18} />
                    </button>

                    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5 rounded-full bg-[#4A3B32]/40 px-3 py-1">
                      {photos.map((_, index) => (
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
            {profile.bio && (
              <div className="rounded-2xl border border-neutral-200 bg-[#faf7f3] p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Bio</p>
                <p className="mt-2 text-sm text-neutral-700">{profile.bio}</p>
              </div>
            )}

            <div className="rounded-2xl border border-neutral-200 bg-[#faf7f3] p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.interests ? (
                  <span className="text-sm text-neutral-700">{profile.interests}</span>
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
