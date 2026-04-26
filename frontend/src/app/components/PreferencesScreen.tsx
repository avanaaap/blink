import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
<<<<<<< HEAD
import { defaultUserProfilePreferences, loadUserProfilePreferences, saveUserProfilePreferences } from '../../lib/profile-storage';

export function PreferencesScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState(() => (isEditMode ? loadUserProfilePreferences() : defaultUserProfilePreferences));
=======
import { updateMyProfile } from '../../lib/api/profile-api';

export function PreferencesScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    // Profile basics
    name: '',
    age: '' as string | number,

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
    photos: [] as { url: string; caption: string }[],
  });
>>>>>>> 21670ad95767a681d2c5a761ecfb5fb1cf98d3ea

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (preferences.photos.length >= 5) return;
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreferences(prev => ({
        ...prev,
        photos: [...prev.photos, { url, caption: '' }]
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

  const handleRemovePhoto = (index: number) => {
    setPreferences(prev => {
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      return { ...prev, photos: newPhotos };
    });
  };

<<<<<<< HEAD
  const handleSaveAndExit = () => {
    saveUserProfilePreferences(preferences);
=======
  const buildProfilePayload = () => ({
    name: preferences.name,
    age: Number(preferences.age),
    interested_in: preferences.interestedIn,
    relationship_type: preferences.relationshipType || undefined,
    age_range_min: preferences.ageRange[0],
    age_range_max: preferences.ageRange[1],
    interests: preferences.interests,
    relationship_meaning: preferences.relationshipMeaning,
    time_with_partner: preferences.timeWithPartner,
    conflict_style: preferences.conflictStyle || undefined,
    island_scenario: preferences.islandScenario || undefined,
    musical_instrument: preferences.musicalInstrument || undefined,
    sexuality: preferences.sexuality || undefined,
    spending_habits: preferences.spendingHabits || undefined,
    has_debt: preferences.hasDebt || undefined,
    wants_kids: preferences.wantsKids || undefined,
  });

  const handleSaveAndExit = async () => {
    setSaving(true);
    try {
      await updateMyProfile(buildProfilePayload());
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
>>>>>>> 21670ad95767a681d2c5a761ecfb5fb1cf98d3ea
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
        return preferences.name.trim().length > 0 && Number(preferences.age) >= 18;
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

<<<<<<< HEAD
  const handleComplete = () => {
    saveUserProfilePreferences(preferences);
    navigate(`${APP_ROUTES.myProfile}?fromSetup=true`);
=======
  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateMyProfile(buildProfilePayload());
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
    navigate(APP_ROUTES.match);
>>>>>>> 21670ad95767a681d2c5a761ecfb5fb1cf98d3ea
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleSaveAndExit}
            className="text-sm font-medium text-neutral-500 hover:text-black border-b border-transparent hover:border-black transition-colors pb-1"
          >
            Save & Exit
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          <BlinkLogo size={60} className="text-black" />
          <h1 className="text-3xl">{isEditMode ? 'Edit Your Profile' : 'Build Your Profile'}</h1>
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
        </div>

        <div className="flex flex-col gap-8">
          {step === 0 && (
            <>
              <div>
                <h2 className="text-xl mb-2">What's your name?</h2>
                <input
                  type="text"
                  value={preferences.name}
                  onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                  placeholder="Your first name"
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
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
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </>
          )}

          {step === 1 && (
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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

          {step === 2 && (
            <>
              <div>
                <h2 className="text-xl mb-2">Age Range</h2>
                <p className="text-sm text-neutral-500 mb-4">Who would you like to meet?</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">Minimum</label>
                    <input
                      type="number"
                      min="18"
                      max="80"
                      value={preferences.ageRange[0]}
                      onChange={(e) => setPreferences({ ...preferences, ageRange: [parseInt(e.target.value), preferences.ageRange[1]] })}
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">Maximum</label>
                    <input
                      type="number"
                      min="18"
                      max="80"
                      value={preferences.ageRange[1]}
                      onChange={(e) => setPreferences({ ...preferences, ageRange: [preferences.ageRange[0], parseInt(e.target.value)] })}
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
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
                          ? 'border-black bg-neutral-50'
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

          {step === 3 && (
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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

          {step === 4 && (
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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

          {step === 5 && (
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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
                          ? 'border-black bg-neutral-50'
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

          {step === 6 && (
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
                          className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-black"
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
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  ))}

                  {preferences.photos.length < 5 && (
                    <label className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:border-black hover:text-black cursor-pointer transition-colors bg-neutral-50">
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
        </div>
      </div>
    </div>
  );
}
