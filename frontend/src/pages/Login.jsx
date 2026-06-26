import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setErrorMsg('');
  };

  const validate = () => {
    const tempErrors = {};
    if (!form.email.trim()) {
      tempErrors.email = 'Email address is required';
    }
    if (!form.password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(form.email, form.password);
      navigate('/app/home');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Google sign-in handlers ───────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/app/home');
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Google sign-in failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-ink antialiased">
      {/* Brand logo link back to "/" */}
      <Link to="/" className="flex items-center gap-2 mb-8 select-none">
        <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl text-ink tracking-tight">Climate Lens</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-white border border-mist rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Welcome back</h1>
        <p className="font-body text-sm text-gray-500 mb-6">Log in to see your real footprint.</p>

        {/* Backend Error alert */}
        {errorMsg && <ErrorBanner message={errorMsg} />}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide font-body">
              Email address
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-gray-50 font-body focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all ${
                errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200/20' : 'border-mist'
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs font-semibold mt-1 block font-body">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide font-body">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full border rounded-xl pl-4 pr-10 py-2.5 text-sm bg-gray-50 font-body focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all ${
                  errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200/20' : 'border-mist'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs font-semibold mt-1 block font-body">
                {errors.password}
              </span>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <span className="text-xs text-gray-400 font-body cursor-default">
              Forgot password? (coming soon)
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-forest hover:bg-forest-dark text-white font-bold py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest/20 disabled:opacity-75"
          >
            {isSubmitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-mist" />
          <span className="text-xs text-gray-400 font-body font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-mist" />
        </div>

        {/* Google sign-in button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="376"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-mist/50 text-center">
          <p className="text-sm text-gray-500 font-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-forest hover:text-forest-dark font-bold transition-all">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
