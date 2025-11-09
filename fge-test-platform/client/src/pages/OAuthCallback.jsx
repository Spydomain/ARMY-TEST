import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth', token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [search, navigate]);

  return (
    <div className="p-6 text-center">Signing you in…</div>
  );
}
