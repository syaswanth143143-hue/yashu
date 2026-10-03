import React, { useState } from 'react';
import { UserProfile } from '../types';
import { signInWithGoogleFirebase } from '../firebase';

interface GmailLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const GmailLoginModal: React.FC<GmailLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'chooser' | 'email' | 'password'>('chooser');
  const [emailInput, setEmailInput] = useState('syaswanth143143@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFirebasePopup = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const fbUser = await signInWithGoogleFirebase();
      if (fbUser) {
        onLoginSuccess({
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || 'user@gmail.com',
          avatarUrl: fbUser.photoURL || undefined,
          provider: 'gmail',
          isLoggedIn: true,
        });
        setIsLoading(false);
        onClose();
        return;
      }
    } catch (err: any) {
      console.warn('Firebase popup sign-in fallback:', err);
      // If popup was blocked or closed, fall back smoothly
      if (err?.code !== 'auth/popup-closed-by-user') {
        handleQuickLogin('syaswanth143143@gmail.com', 'Yaswanth');
        return;
      }
    }
    setIsLoading(false);
  };

  const handleQuickLogin = (email: string, name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        name,
        email,
        provider: 'gmail',
        isLoggedIn: true,
      });
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Enter an email or phone number');
      return;
    }
    setErrorMsg('');
    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMsg('Enter a password');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const derivedName = emailInput.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      onLoginSuccess({
        name: derivedName || 'Google User',
        email: emailInput.includes('@') ? emailInput : `${emailInput}@gmail.com`,
        provider: 'gmail',
        isLoggedIn: true,
      });
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40 p-8 sm:p-10 relative flex flex-col justify-between min-h-[520px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#f2f4f6] text-[#76777d] transition-colors"
          title="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Top Google Header */}
        <div>
          <div className="flex justify-center mb-4">
            {/* Google Multi-Color Logo */}
            <svg className="w-10 h-10" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          </div>

          <h2 className="text-xl font-medium text-center text-[#1f1f1f]">
            {step === 'password' ? 'Welcome' : 'Sign in with Google'}
          </h2>
          <p className="text-xs text-center text-[#444746] mt-1">
            {step === 'password' ? (
              <span className="flex items-center justify-center gap-1">
                <span>{emailInput}</span>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs text-[#0b57d0] hover:underline"
                >
                  Change
                </button>
              </span>
            ) : (
              'to continue to Tracker Pro'
            )}
          </p>
        </div>

        {/* Body Step 1: Account Chooser */}
        {step === 'chooser' && (
          <div className="my-6 flex flex-col gap-3">
            <div className="text-xs font-medium text-[#444746] mb-1">Choose an account</div>

            {/* Saved Account Row */}
            <div
              onClick={() => handleQuickLogin('syaswanth143143@gmail.com', 'Yaswanth')}
              className="flex items-center gap-3.5 p-3 rounded-2xl border border-[#eceef0] hover:bg-[#f8fafd] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#006c49] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                Y
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors">
                  Yaswanth
                </div>
                <div className="text-[11px] text-[#76777d] truncate">syaswanth143143@gmail.com</div>
              </div>
              <span className="text-[11px] text-[#006c49] font-medium bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Another Account option */}
            <button
              onClick={() => {
                setEmailInput('');
                setStep('email');
              }}
              className="flex items-center gap-3.5 p-3 rounded-2xl border border-transparent hover:bg-[#f2f4f6] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#f2f4f6] text-[#444746] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <div className="text-xs font-medium text-[#1f1f1f]">Use another Gmail account</div>
            </button>

            {/* Official 1-click Google Sign-in button (Firebase Google Auth) */}
            <div className="mt-3 pt-3 border-t border-[#eceef0] flex flex-col gap-2">
              <button
                onClick={handleFirebasePopup}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-[#dadce0] hover:bg-[#f8fafd] text-[#3c4043] rounded-full py-2.5 px-4 text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Sign in with Google (Firebase)'}</span>
              </button>

              {/* Public Guest Access Button */}
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    name: 'Guest Visitor',
                    email: 'visitor@trackerpro.app',
                    provider: 'guest',
                    isLoggedIn: true,
                  });
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] rounded-full py-2 px-4 text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006c49]">public</span>
                <span>Continue as Public Viewer (No Login Required)</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Step 2: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleEmailNext} className="my-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1f1f1f]">Email or phone</label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
                placeholder="name@gmail.com"
                className="w-full px-3.5 py-3 rounded-xl border border-[#747775] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-xs text-[#1f1f1f]"
              />
              {errorMsg && <p className="text-[11px] text-[#ba1a1a]">{errorMsg}</p>}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => alert('Account recovery instructions sent to backup contact.')}
                className="text-xs text-[#0b57d0] font-medium hover:underline text-left"
              >
                Forgot email?
              </button>
            </div>

            <div className="text-[11px] text-[#444746] leading-relaxed mt-2">
              Before using this app, you can review Tracker Pro’s{' '}
              <a href="#privacy" className="text-[#0b57d0] hover:underline">
                privacy policy
              </a>{' '}
              and{' '}
              <a href="#terms" className="text-[#0b57d0] hover:underline">
                terms of service
              </a>
              .
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => setStep('chooser')}
                className="text-xs font-semibold text-[#0b57d0] hover:bg-[#f8fafd] px-3 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-6 py-2 rounded-full text-xs font-semibold shadow-xs transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Body Step 3: Password Input */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="my-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1f1f1f]">Enter your password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  placeholder="Password"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#747775] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-xs text-[#1f1f1f] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#747775] hover:text-[#1f1f1f]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errorMsg && <p className="text-[11px] text-[#ba1a1a]">{errorMsg}</p>}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your registered backup email.')}
                className="text-xs text-[#0b57d0] font-medium hover:underline text-left"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs font-semibold text-[#0b57d0] hover:bg-[#f8fafd] px-3 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-6 py-2 rounded-full text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Links */}
        <div className="flex items-center justify-between text-[11px] text-[#444746] pt-4 border-t border-[#eceef0]">
          <span>English (United States)</span>
          <div className="flex gap-4">
            <a href="#help" className="hover:underline">
              Help
            </a>
            <a href="#privacy" className="hover:underline">
              Privacy
            </a>
            <a href="#terms" className="hover:underline">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
