import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getCurrentUser, isAdmin } from '../utils/auth.js';

/**
 * Login page component at '/login'.
 * Form with username and password fields.
 * Authenticates via auth.login(). On success, redirects admin to '/admin', user to '/blogs'.
 * Shows inline error on failure. Redirects already-authenticated users to their home.
 * Link to '/register' for new users.
 */
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (isAdmin()) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    }
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = login(username, password);

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (result.session && result.session.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-3xl font-bold text-primary-700 hover:text-primary-800 transition-colors"
          >
            ✍️ WriteSpace
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-surface-800">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Sign in to your account to continue writing
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-surface-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-white shadow-sm transition-colors ${
                loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-surface-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;