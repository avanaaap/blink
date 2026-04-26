import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { getMyProfile, updateMyProfile } from '../../lib/api/profile-api';
import { uploadPhoto, deletePhoto, listMyPhotos } from '../../lib/api/photo-api';
import type { Profile } from '../../lib/types';

export function PreferencesScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(isEditMode);
  const [preferences, setPreferences] = useState({
    // Profile basics
    firstName: '',
    lastName: '',
    age: '' as string | number,

    gender: '',

    // Basic preferences
    interestedIn: [] as string[],
    relationshipType: '',
    ageRange: [22, 35],
    interests: [] as string[],

    // Deep questions
    relationshipMeaning: [] as string[],
    timeWithPartner: [] as string[],
    conflictStyle: '',
    islandScenario: '',
    musicalInstrument: '',

    // Lifestyle
    sexuality: '',
    spendingHabits: '',
    hasDebt: '',
    wantsKids: '',

    // Photos
    photos: [] as { file?: File; url: string; caption: string; uploaded?: boolean; photoId?: string }[],
  });

  // Load existing profile data in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    Promise.all([getMyProfile(), listMyPhotos()])
      .then(([profile, photos]) => {
        if (cancelled) return;
        const nameParts = (profile.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        setPreferences({
          firstName,
          lastName,
          age: profile.age || '',
          gender: profile.gender || '',
          interestedIn: profile.interested_in || [],
          relationshipType: profile.relationship_type || '',
          ageRange: [profile.age_range_min ?? 22, profile.age_range_max ?? 35],
          interests: profile.interests || [],
          relationshipMeaning: profile.relationship_meaning || [],
          timeWithPartner: profile.time_with_partner || [],
          conflictStyle: profile.conflict_style || '',
          islandScenario: profile.island_scenario || '',
          musicalInstrument: profile.musical_instrument || '',
          sexuality: profile.sexuality || '',
          spendingHabits: profile.spending_habits || '',
          hasDebt: profile.has_debt || '',
          wantsKids: profile.wants_kids || '',
          photos: photos.map(p => ({
            url: p.url,
            caption: p.caption || '',
            uploaded: true,
            photoId: p.id,
          })),
        });
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => { cancelled = true; };
  }, [isEditMode]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (preferences.photos.length >= 5) return;
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreferences(prev => ({
        ...prev,
        photos: [...prev.photos, { file, url, caption: '', uploaded: false }]
      }));
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setPreferences(prev => {
      const newPhotos = [...prev.photos];
      newPhotos[index].caption = caption;
      return { ...prev, photos: newPhotos };
    });
  };

  const handleRemovePhoto = async (index: number) => {
    const photo = preferences.photos[index];
    if (photo.photoId) {
      try {
        await deletePhoto(photo.photoId);
      } catch (e) {
        console.error('Failed to delete photo:', e);
      }
    }
    setPreferences(prev => {
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      return { ...prev, photos: newPhotos };
    });
  };

  const uploadPendingPhotos = async () => {
    for (let i = 0; i < preferences.photos.length; i++) {
      const photo = preferences.photos[i];
      if (!photo.uploaded && photo.file) {
        try {
          await uploadPhoto(photo.file, i, photo.caption);
        } catch (e) {
          console.error(`Failed to upload photo ${i}:`, e);
        }
      }
    }
  };

  const buildProfilePayload = (): Partial<Profile> => ({
    name: `${preferences.firstName.trim()} ${preferences.lastName.trim()}`.trim(),
    age: Number(preferences.age),
    gender: (preferences.gender || undefined) as Profile['gender'],
    interested_in: preferences.interestedIn as Profile['interested_in'],
    relationship_type: (preferences.relationshipType || undefined) as Profile['relationship_type'],
    age_range_min: preferences.ageRange[0],
    age_range_max: preferences.ageRange[1],
    interests: preferences.interests as Profile['interests'],
    relationship_meaning: preferences.relationshipMeaning as Profile['relationship_meaning'],
    time_with_partner: preferences.timeWithPartner as Profile['time_with_partner'],
    conflict_style: (preferences.conflictStyle || undefined) as Profile['conflict_style'],
    island_scenario: (preferences.islandScenario || undefined) as Profile['island_scenario'],
    musical_instrument: (preferences.musicalInstrument || undefined) as Profile['musical_instrument'],
    sexuality: (preferences.sexuality || undefined) as Profile['sexuality'],
    spending_habits: (preferences.spendingHabits || undefined) as Profile['spending_habits'],
    has_debt: (preferences.hasDebt || undefined) as Profile['has_debt'],
    wants_kids: (preferences.wantsKids || undefined) as Profile['wants_kids'],
  });

  const handleSaveAndExit = async () => {
    setSaving(true);
    try {
      await updateMyProfile(buildProfilePayload());
      await uploadPendingPhotos();
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
    navigate(APP_ROUTES.match);
  };

  const interestOptions = [
    'Travel', 'Music', 'Art', 'Sports', 'Cooking', 'Reading',
    'Technology', 'Fitness', 'Movies', 'Photography', 'Gaming', 'Nature'
  ];

  const toggleArrayField = (field: keyof typeof preferences, value: string) => {
    const currentArray = preferences[field] as string[];
    setPreferences(prev => ({
      ...prev,
      [field]: currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return preferences.firstName.trim().length > 0 && preferences.lastName.trim().length > 0 && Number(preferences.age) >= 18 && preferences.gender !== '';
      case 1:
        return preferences.interestedIn.length > 0 && preferences.relationshipType;
      case 2:
        return preferences.ageRange[0] < preferences.ageRange[1] && preferences.interests.length >= 3;
      case 3:
        return preferences.relationshipMeaning.length > 0 && preferences.timeWithPartner.length > 0;
      case 4:
        return preferences.conflictStyle && preferences.islandScenario && preferences.musicalInstrument;
      case 5:
        return preferences.sexuality && preferences.spendingHabits && preferences.hasDebt && preferences.wantsKids;
      case 6:
        return true; // Images are optional
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateMyProfile(buildProfilePayload());
      await uploadPendingPhotos();
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
    navigate(APP_ROUTES.match);
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleSaveAndExit}
            className="text-sm font-medium text-neutral-500 hover:text-[#4A3B32] border-b border-transparent hover:border-[#4A3B32] transition-colors pb-1"
          >
            Save & Exit
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          <BlinkLogo size={60} className="text-[#4A3B32]" />
          <h1 className="text-3xl">{isEditMode ? 'Edit Your Profile' : 'Build Your Profile'}</h1>
          {!isEditMode && (
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(s => (
                <div
                  key={s}
                  className={`h-2 w-10 rounded-full transition-colors ${
                    s <= step ? 'bg-[#4A3B32]' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {(isEditMode || step === 0) && (
            <>
              <div>
                <h2 className="text-xl mb-2">What's your name?</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={preferences.firstName}
                    onChange={(e) => setPreferences({ ...preferences, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-[#4A3B32]"
                  />
                  <input
                    type="text"
                    value={preferences.lastName}
                    onChange={(e) => setPreferences({ ...preferences, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-[#4A3B32]"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl mb-2">How old are you?</h2>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={preferences.age}
                  onChange={(e) => setPreferences({ ...preferences, age: e.target.value })}
                  placeholder="Age"
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-[#4A3B32]"
                />
              </div>
              <div>
                <h2 className="text-xl mb-2">I identify as</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['Man', 'Woman', 'Non-binary', 'Prefer not to say'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, gender: option })}
                      className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                        preferences.gender === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(isEditMode || step === 1) && (
            <>
              <div>
                <h2 className="text-xl mb-2">I'm interested in</h2>
                <p className="text-sm text-neutral-500 mb-4">Select all that apply</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Women', 'Men', 'Non-binary'].map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayField('interestedIn', option)}
                      className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                        preferences.interestedIn.includes(option)
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">Relationship Type</h2>
                <p className="text-sm text-neutral-500 mb-4">What are you looking for?</p>
                <div className="flex flex-col gap-2">
                  {['Monogamy', 'Polyamory', 'Open to Either'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, relationshipType: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.relationshipType === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-600">
                <p className="mb-2">Safe & Secure Dating</p>
                <p className="text-xs">All profiles undergo background verification to ensure a safe community. We verify identity and screen for safety concerns.</p>
              </div>
            </>
          )}

          {(isEditMode || step === 2) && (
            <>
              <div>
                <h2 className="text-xl mb-2">Age Range</h2>
                <p className="text-sm text-neutral-500 mb-4">Who would you like to meet?</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-medium text-[#4A3B32]">{preferences.ageRange[0]}</span>
                  <span className="text-sm text-neutral-400">to</span>
                  <span className="text-lg font-medium text-[#4A3B32]">{preferences.ageRange[1]}</span>
                </div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute w-full h-1.5 bg-neutral-200 rounded-full" />
                  <div
                    className="absolute h-1.5 bg-[#D4A574] rounded-full"
                    style={{
                      left: `${((preferences.ageRange[0] - 18) / (80 - 18)) * 100}%`,
                      right: `${100 - ((preferences.ageRange[1] - 18) / (80 - 18)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={preferences.ageRange[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val < preferences.ageRange[1]) {
                        setPreferences({ ...preferences, ageRange: [val, preferences.ageRange[1]] });
                      }
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4A3B32] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4A3B32] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={preferences.ageRange[1]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > preferences.ageRange[0]) {
                        setPreferences({ ...preferences, ageRange: [preferences.ageRange[0], val] });
                      }
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4A3B32] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4A3B32] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-neutral-400">18</span>
                  <span className="text-xs text-neutral-400">80</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">Your Interests</h2>
                <p className="text-sm text-neutral-500 mb-4">Select at least 3</p>
                <div className="grid grid-cols-3 gap-3">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleArrayField('interests', interest)}
                      className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                        preferences.interests.includes(interest)
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(isEditMode || step === 3) && (
            <>
              <div>
                <h2 className="text-xl mb-2">What does being in a relationship mean to you?</h2>
                <p className="text-sm text-neutral-500 mb-4">Select all that apply</p>
                <div className="flex flex-col gap-2">
                  {['Emotional support', 'Quality time', 'Trust & connection', 'Shared experiences', 'Commitment', 'Physical affection'].map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayField('relationshipMeaning', option)}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.relationshipMeaning.includes(option)
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">How do you approach spending time with your partner?</h2>
                <p className="text-sm text-neutral-500 mb-4">Select all that apply</p>
                <div className="flex flex-col gap-2">
                  {['Mostly together', 'Balanced', 'Need personal space', 'Depends on the relationship'].map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayField('timeWithPartner', option)}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.timeWithPartner.includes(option)
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(isEditMode || step === 4) && (
            <>
              <div>
                <h2 className="text-xl mb-2">During a disagreement with your partner, are you more likely to:</h2>
                <div className="flex flex-col gap-2 mt-4">
                  {['Talk it out right away', 'Take space, then come back to it', 'Avoid it / keep the peace'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, conflictStyle: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.conflictStyle === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">You are on a stranded island, what is the first thing that you would do?</h2>
                <div className="flex flex-col gap-2 mt-4">
                  {['Cry', 'Explore the island for resources', 'Try to signal for help', 'Stay calm and make a plan'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, islandScenario: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.islandScenario === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">What musical instrument would you be?</h2>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {['Guitar', 'Piccolo', 'Tuba', 'Saxophone', 'Flute', 'Clarinet'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, musicalInstrument: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.musicalInstrument === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(isEditMode || step === 5) && (
            <>
              <div>
                <h2 className="text-xl mb-2">Sexuality</h2>
                <div className="flex flex-col gap-2 mt-4">
                  {['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Prefer not to say'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, sexuality: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.sexuality === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">Spending Habits</h2>
                <div className="flex flex-col gap-2 mt-4">
                  {['Frugal / Saver', 'Balanced', 'Enjoy spending', 'Live in the moment'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, spendingHabits: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.spendingHabits === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">Do you have debt?</h2>
                <div className="flex flex-col gap-2 mt-4">
                  {['No debt', 'Student loans', 'Credit card debt', 'Prefer not to say'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, hasDebt: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.hasDebt === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl mb-2">Do you want kids?</h2>
                <div className="flex flex-col gap-2 mt-4">
                  {['Yes', 'No', 'Maybe / Open to it', 'Already have kids'].map(option => (
                    <button
                      key={option}
                      onClick={() => setPreferences({ ...preferences, wantsKids: option })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                        preferences.wantsKids === option
                          ? 'border-[#4A3B32] bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(isEditMode || step === 6) && (
            <>
              <div>
                <h2 className="text-xl mb-2">Profile Pictures (Optional)</h2>
                <p className="text-sm text-neutral-500 mb-4">Add up to 5 photos. These will only be visible after a successful video call.</p>
                
                <div className="flex flex-col gap-6">
                  {preferences.photos.map((photo, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                      <div className="w-24 h-32 bg-neutral-200 rounded-lg overflow-hidden shrink-0 relative">
                        <img src={photo.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 bg-[#4A3B32]/50 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#4A3B32]"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-neutral-700 mb-2">Caption</label>
                        <input
                          type="text"
                          maxLength={60}
                          value={photo.caption}
                          onChange={(e) => handleCaptionChange(idx, e.target.value)}
                          placeholder="Write a caption..."
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#4A3B32]"
                        />
                      </div>
                    </div>
                  ))}

                  {preferences.photos.length < 5 && (
                    <label className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:border-[#4A3B32] hover:text-[#4A3B32] cursor-pointer transition-colors bg-neutral-50">
                      <span className="text-2xl mb-2">+</span>
                      <span>Upload Photo ({preferences.photos.length}/5)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {isEditMode ? (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full bg-[#4A3B32] text-white py-4 px-8 rounded-full hover:bg-[#322822] transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed mt-4"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <div className="flex gap-3 mt-4">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 py-4 px-6 border-2 border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
              )}

              {step < 6 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#4A3B32] text-white py-4 px-8 rounded-full hover:bg-[#322822] transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex-1 bg-[#4A3B32] text-white py-4 px-8 rounded-full hover:bg-[#322822] transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Complete Setup'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
