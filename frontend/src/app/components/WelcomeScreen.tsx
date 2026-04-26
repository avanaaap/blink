import { useEffect } from 'react';
import { BlinkLogo } from './BlinkLogo';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { useWorldIdVerify } from '../../lib/hooks/useWorldIdVerify';
import { getAccessToken } from '../../lib/api/client';
import { QRCodeSVG } from 'qrcode.react';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { status, error, connectUrl, verify } = useWorldIdVerify();

  // If user already has a valid token, skip verification
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      navigate(APP_ROUTES.match, { replace: true });
    }
  }, [navigate]);

  const handleVerify = async () => {
    const result = await verify();
    if (result) {
      if (result.is_new_user) {
        navigate(APP_ROUTES.preferences);
      } else {
        navigate(APP_ROUTES.match);
      }
    }
  };

  const isLoading = status === "signing" || status === "verifying";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        <BlinkLogo size={120} className="text-black" />
        <div className="text-center">
          <h1 className="text-5xl tracking-tight mb-2">Blink</h1>
          <p className="text-sm text-neutral-500 italic">Blind Link</p>
        </div>
        <p className="text-center text-neutral-600 text-lg">
          Authentic connections through meaningful conversations
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          {connectUrl ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-neutral-700 font-medium">
                Scan with World App
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-neutral-200">
                <QRCodeSVG
                  value={connectUrl}
                  size={240}
                  level="M"
                  includeMargin
                />
              </div>
              <p className="text-sm text-neutral-500 animate-pulse">
                Waiting for verification...
              </p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleVerify}
                fullWidth
                disabled={isLoading}
              >
                {isLoading
                  ? status === "signing"
                    ? "Preparing..."
                    : "Verifying..."
                  : status === "error"
                    ? "Try Again"
                    : "Verify with World ID"}
              </Button>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </>
          )}

          <p className="text-xs text-neutral-400 text-center mt-2">
            Verified by World ID — one account per person
          </p>
        </div>
      </div>
    </div>
  );
}
