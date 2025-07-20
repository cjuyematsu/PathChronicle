"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FlagSelectorPopup } from '../../components/flagSelector';
import { getCountryName } from '@/src/data/countries';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('us');
  const [showFlagSelector, setShowFlagSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password || !countryCode) {
          alert('Please fill in all fields to sign up.');
          return;
        }
        await signup(email, password, countryCode);
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        if (!email || !password) {
          alert('Please enter your email and password to sign in.');
          return;
        }
        await login(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg width="50" height="50" fill="currentColor" viewBox="0 0 24 24" transform="" id="injected-svg">
                <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m6.95 13.95c-.09-.16-.17-.3-.2-.38-.07-.15-.21-.61-.31-1.02s-.05-.79.12-.84.41.14.54.43c.08.17.23.43.38.68-.15.39-.32.77-.53 1.13M4 12c0-2.03.77-3.88 2.02-5.3.45.01 1.04.05 1.38.09.38.05.85-.05 1.05-.22.19-.17.57-.48.84-.69s.71-.63.99-.91c.21-.21.49-.57.73-.9.33-.04.66-.07 1-.07 1.6 0 3.1.48 4.35 1.3-.06.19-.11.65-.11 1.01s-.2 1-.44 1.41-.55.81-.67.88c-.13.07-.37.35-.54.63-.17.27-.46.37-.66.22s-.23-.49-.08-.74c.15-.26-.01-.55-.36-.65s-.9-.01-1.23.19c-.33.21-.9.72-1.27 1.14s-.75 1.03-.84 1.36 0 .65.22.71c.21.06.2.23-.03.36s-.6.34-.82.46-.43.57-.47.99c-.03.43-.33.75-.66.71s-.6.13-.6.38-.09.49-.2.53-.46.07-.78.07-.62.2-.67.46-.03.6.06.76.27.37.42.45c.14.09.46.17.7.19s.61-.1.82-.27.64-.4.96-.5c.32-.11.71-.11.85 0 .15.11.52.55.83.98s.65.58.76.32.07-.63-.09-.83-.08-.28.19-.18.56.44.63.76c.08.32.31.75.52.95s.55 0 .76-.45.53-1.19.71-1.64c.18-.46.45-.71.6-.56s.5.21.79.14.65-.11.8-.08.33.21.39.41-.32.42-.84.48l-.16.03-.46.09c-.58.23-1.02.73-1 1.1s.41.61.85.52.85-.04.91.12.01.47-.1.69c0 .01-.02.02-.03.03-.21.12-.42.23-.64.33-.13.03-.27.05-.4.05-.48 0-1.14-.02-1.48-.05-.33-.04-.83.05-1.1.18-.27.14-.82.2-1.23.14s-.84-.51-.97-1.01-.8-.81-1.5-.7c-.61.1-1.55.02-2.27-.16a7.96 7.96 0 0 1-2.4-5.7Z"/>
                <path d="M6.75 12.6c.01.05.1.09.19.08.09 0 .33.02.52.05.2.04.44.01.55-.05s.22-.23.25-.36a.47.47 0 0 0-.17-.43c-.12-.1-.17-.4-.1-.67s.18-.58.25-.68.08-.24.03-.3-.18-.11-.28-.11-.29.04-.42.1c-.13.05-.24.27-.24.47s.05.54.1.73c.06.2-.08.52-.3.71-.22.2-.39.4-.38.45Z"/>
                <path d="M6.69 11.96c.26-.19.45-.41.43-.5s-.08-.15-.15-.15-.24.03-.38.06-.31.19-.37.36c-.06.16-.08.36-.05.44s.27-.01.52-.2ZM15.1 7.04c.26.04.52.04.58 0s.03-.18-.08-.3c-.1-.12-.21-.4-.24-.62s-.03-.55 0-.72-.02-.33-.1-.36-.25.09-.38.27-.24.62-.24.99.21.71.47.75Z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <button
                  type="button"
                  onClick={() => setShowFlagSelector(true)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <span className={`fi fi-${countryCode} text-xl`} />
                    <span>{getCountryName(countryCode)}</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-600 dark:text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button 
                  type="button" 
                  onClick={toggleFormMode}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      <FlagSelectorPopup
        isOpen={showFlagSelector}
        onClose={() => setShowFlagSelector(false)}
        onSelectFlag={setCountryCode}
        selectedCode={countryCode}
      />
    </div>
  );
}

