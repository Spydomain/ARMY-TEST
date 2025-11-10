import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import TestPage from './pages/TestPage.jsx';
import Results from './pages/Results.jsx';
import Login from './pages/Login.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';

function RequireAuth({ children }) {
  const authed = !!localStorage.getItem('auth');
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/test/:category"
        element={
          <RequireAuth>
            <TestPage />
          </RequireAuth>
        }
      />
      <Route
        path="/results"
        element={
          <RequireAuth>
            <Results />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
