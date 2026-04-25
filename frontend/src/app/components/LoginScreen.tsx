import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { APP_ROUTES } from '../../lib/routes';
import { BackButton } from '../../components/BackButton';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(APP_ROUTES.match);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <BackButton onClick={() => navigate(APP_ROUTES.landing)} />

        <div className="flex flex-col items-center gap-6 mb-12">
          <BlinkLogo size={80} className="text-black" />
          <h1 className="text-3xl">Welcome Back</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <Button type="submit" className="mt-4" fullWidth>
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
}
