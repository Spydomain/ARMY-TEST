import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const continueAsGuest = () => {
    localStorage.setItem('auth', 'guest');
    navigate('/', { replace: true });
  };

  const continueWithGoogle = () => {
    alert('Google login is not configured yet. Please try as guest for now.');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6 bg-card shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Sign in to start your identification test.
        </p>

        <div className="space-y-3">
          <button
            onClick={continueAsGuest}
            className="w-full px-4 py-2 rounded-md bg-blue-600 text-white"
          >
            Continue as Guest
          </button>

          <div className="text-center text-sm text-muted-foreground">
            or
          </div>

          <button
            onClick={continueWithGoogle}
            className="w-full px-4 py-2 rounded-md border"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Your language preference is saved locally and can be changed later.
        </p>
      </div>
    </div>
  );
}
