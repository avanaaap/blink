import { useEffect, useState } from 'react';
import { BlinkLogo } from './BlinkLogo';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { useWorldIdVerify } from '../../lib/hooks/useWorldIdVerify';
import { getAccessToken } from '../../lib/api/client';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { status, error, connectUrl, verify } = useWorldIdVerify();
  const [showAuthPanel, setShowAuthPanel] = useState(false);

  // If user already has a valid token, skip verification
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      navigate(APP_ROUTES.match, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setShowAuthPanel(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async () => {
    const result = await verify();
    if (result) {
      if (result.is_new_user) {
        navigate(`${APP_ROUTES.preferences}?mode=create`);
      } else {
        navigate(APP_ROUTES.match);
      }
    }
  };

  const isLoading = status === "signing" || status === "verifying";
  const buttonLabel = isLoading
    ? status === "signing"
      ? "Preparing..."
      : "Verifying..."
    : status === "error"
      ? "Try Again"
      : "Verify with World ID";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f8f5f1] to-[#efe8df] px-6">
      <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#E8C9A0]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-20 h-48 w-48 rounded-full bg-[#D4A574]/25 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center">
        <div
          className={[
            'absolute left-1/2 z-10 -translate-x-1/2 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]',
            showAuthPanel ? 'top-12 scale-90' : 'top-1/2 -translate-y-1/2 scale-125',
          ].join(' ')}
        >
          <div className="eye-logo-intro eye-logo-shell">
            <BlinkLogo size={120} className="eye-logo-blink text-[#4A3B32]" />
            <div className="eye-lid-overlay" />
          </div>
        </div>

        <div
          className={[
            'mt-auto mb-12 w-full rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur transition-all duration-700',
            showAuthPanel ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
          ].join(' ')}
        >
          <div className="text-center">
            <h1 className="text-5xl tracking-tight mb-2">Blink</h1>
            <p className="text-sm text-neutral-500 italic">Love is Blind, conversation comes first</p>
          </div>

          <p className="mt-5 text-center text-neutral-700">
            Build chemistry through words first. Voice and video unlock as interest grows.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3">
            {connectUrl ? (
              <div className="flex flex-col items-center gap-4">
                <a
                  href={connectUrl}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4A3B32] px-8 py-4 text-white transition-colors hover:bg-[#322822]"
                >
                  Open in World App
                </a>
                <p className="text-sm text-neutral-500 animate-pulse">
                  Waiting for verification...
                </p>
              </div>
            ) : (
              <Button
                onClick={handleVerify}
                fullWidth
                disabled={isLoading}
              >
                {buttonLabel}
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-3 text-center text-sm text-red-500">{error}</p>
          )}

          <p className="text-xs text-neutral-400 text-center mt-4">
            Verified by World ID — one account per person
          </p>
        </div>
      </div>
    </div>
  );
}
