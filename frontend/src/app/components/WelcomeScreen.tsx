import { BlinkLogo } from './BlinkLogo';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';
import { useWorldIdVerify } from '../../lib/hooks/useWorldIdVerify';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { status, error, verify } = useWorldIdVerify();

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

  const isLoading = status === "signing" || status === "waiting" || status === "verifying";

  const buttonLabel = {
    idle: "Verify with World ID",
    signing: "Preparing...",
    waiting: "Waiting for World App...",
    verifying: "Verifying...",
    success: "Redirecting...",
    error: "Try Again",
  }[status];

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

        <div className="mt-8 flex w-full flex-col gap-4">
          <Button
            onClick={handleVerify}
            fullWidth
            disabled={isLoading}
          >
            {buttonLabel}
          </Button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <p className="text-xs text-neutral-400 text-center mt-2">
            Verified by World ID — one account per person
          </p>
        </div>
      </div>
    </div>
  );
}
