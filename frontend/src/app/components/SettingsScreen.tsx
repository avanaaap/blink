import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, User, Heart, HelpCircle } from 'lucide-react';
import { BlinkLogo } from './BlinkLogo';
import { APP_ROUTES } from '../../lib/routes';
import { ToggleSwitch } from '../../components/ToggleSwitch';

export function SettingsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [pauseMatches, setPauseMatches] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(APP_ROUTES.match)}
          className="flex items-center gap-2 text-neutral-600 hover:text-black mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex flex-col items-center gap-4 mb-12">
          <BlinkLogo size={60} className="text-black" />
          <h1 className="text-3xl">Settings</h1>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border-b border-neutral-200 pb-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <User size={20} />
              Account
            </h2>
            <div className="flex flex-col gap-3">
              <button className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                Edit Profile
              </button>
              <button className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          <div className="border-b border-neutral-200 pb-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <Heart size={20} />
              Preferences
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(APP_ROUTES.preferences)}
                className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Update Match Preferences
              </button>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Pause Matches</span>
                <ToggleSwitch checked={pauseMatches} onChange={setPauseMatches} />
              </div>
            </div>
          </div>

          <div className="border-b border-neutral-200 pb-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </h2>
            <div className="flex items-center justify-between px-4 py-3">
              <span>Push Notifications</span>
              <ToggleSwitch checked={notifications} onChange={setNotifications} />
            </div>
          </div>

          <div className="border-b border-neutral-200 pb-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <Lock size={20} />
              Privacy & Safety
            </h2>
            <div className="flex flex-col gap-3">
              <button className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                Blocked Users
              </button>
              <button className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                Privacy Policy
              </button>
            </div>
          </div>

          <div className="pb-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <HelpCircle size={20} />
              Support
            </h2>
            <div className="flex flex-col gap-3">
              <button className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                Help Center
              </button>
              <button className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                Contact Us
              </button>
              <button
                onClick={() => navigate(APP_ROUTES.landing)}
                className="text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
