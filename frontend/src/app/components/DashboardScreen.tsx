import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { Settings, LogOut } from 'lucide-react';
import { APP_ROUTES } from '../../lib/routes';
import { matchProfile } from '../../lib/mock-data';
import { Button } from '../../components/Button';
import { getTodayMatch } from '../../lib/api/match-api';

export function DashboardScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUnlockLevel = parseInt(searchParams.get('unlockLevel') || '0');
  const [hasMatch, setHasMatch] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [unlockLevel] = useState(initialUnlockLevel);
  const [match, setMatch] = useState(matchProfile);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");

  useEffect(() => {
    const load = async () => {
      setIsLoadingMatch(true);
      const result = await getTodayMatch();
      setMatch(result.data);
      setDataSource(result.source);
      setIsLoadingMatch(false);
    };
    void load();
  }, []);

  const sharedInterests = match.interests.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <BlinkLogo size={50} className="text-black" />
          <div className="flex gap-4">
            <button
              onClick={() => navigate(APP_ROUTES.settings)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <Settings size={24} />
            </button>
            <button
              onClick={() => navigate(APP_ROUTES.landing)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>

        {!isPaused && hasMatch ? (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h1 className="text-4xl mb-3">Today's Match</h1>
              <p className="text-neutral-600">Your blind date awaits</p>
            </div>

            <div className="w-full bg-neutral-50 rounded-3xl p-8 border-2 border-neutral-200">
              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-neutral-300 to-neutral-400 rounded-full flex items-center justify-center">
                  <span className="text-5xl">?</span>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl mb-2">Today's Match: {match.name}</h2>
                  <p className="text-neutral-600">Profile hidden until rating threshold</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {isLoadingMatch ? "Loading match..." : `Data source: ${dataSource.toUpperCase()}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {sharedInterests.map(interest => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-white border border-neutral-300 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                <div className="w-full bg-white rounded-xl p-4 border border-neutral-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">Compatibility</span>
                    <span className="text-sm">{match.compatibilityScore}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-[#4A3B32] h-2 rounded-full transition-all"
                      style={{ width: `${match.compatibilityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <div className="text-center mb-2">
                <p className="text-neutral-600">
                  {unlockLevel === 0 && 'This text chat will last for 60 minutes.'}
                  {unlockLevel === 1 && 'This voice call will last for 60 minutes.'}
                  {unlockLevel >= 2 && 'This video call will last for 60 minutes.'}
                </p>
              </div>
              <Button
                onClick={() => {
                  if (unlockLevel === 0) navigate(`${APP_ROUTES.chat}?unlockLevel=${unlockLevel}`);
                  else if (unlockLevel === 1) navigate(`${APP_ROUTES.voiceCall}?unlockLevel=${unlockLevel}`);
                  else if (unlockLevel >= 2) navigate(`${APP_ROUTES.videoCall}?unlockLevel=${unlockLevel}`);
                }}
                fullWidth
              >
                {unlockLevel === 0 && 'Start Conversation'}
                {unlockLevel === 1 && 'Start Voice Call'}
                {unlockLevel >= 2 && 'Start Video Call'}
              </Button>
              <Button
                onClick={() => setHasMatch(false)}
                variant="outline"
                fullWidth
              >
                Keep Exploring
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl mb-3">
                {isPaused ? 'Matches Paused' : 'No More Matches'}
              </h1>
              <p className="text-neutral-600">
                {isPaused
                  ? 'Resume anytime to start receiving matches'
                  : 'You have chosen to keep exploring. Check back tomorrow for a new connection.'}
              </p>
            </div>

            <Button
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'Resume Matches' : 'Pause Matches'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
