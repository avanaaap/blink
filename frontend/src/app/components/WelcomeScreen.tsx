import { BlinkLogo } from './BlinkLogo';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes';
import { Button } from '../../components/Button';

export function WelcomeScreen() {
  const navigate = useNavigate();

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
          <Button onClick={() => navigate(APP_ROUTES.signup)} fullWidth>
            Create Account
          </Button>
          <Button
            onClick={() => navigate(APP_ROUTES.login)}
            fullWidth
            className="border-black text-black hover:bg-neutral-50"
            variant="outline"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
