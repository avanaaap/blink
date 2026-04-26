import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlinkLogo } from './BlinkLogo';
import { APP_ROUTES } from '../../lib/routes';
import { BackButton } from '../../components/BackButton';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';

export function SignupScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`${APP_ROUTES.preferences}?mode=create`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <BackButton onClick={() => navigate(APP_ROUTES.landing)} />

        <div className="flex flex-col items-center gap-6 mb-12">
          <BlinkLogo size={80} className="text-black" />
          <h1 className="text-3xl">Create Account</h1>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First name"
              required
            />
            <FormField
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
              required
            />
          </div>

          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            required
          />

          <FormField
            label="Age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="18"
            required
            min="18"
          />

          <FormField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a password"
            required
          />

          <Button type="submit" className="mt-4" fullWidth>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
