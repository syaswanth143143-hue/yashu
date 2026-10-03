import React, { useState } from 'react';
import { Currency, UserProfile } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenAddExpense: () => void;
  currentUser: UserProfile;
  onOpenGmailLogin: () => void;
  onLogout: () => void;
  onOpenShareWeb?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  currency,
  onCurrencyChange,
  onOpenAddExpense,
  currentUser,
  onOpenGmailLogin,
  onLogout,
  onOpenShareWeb,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);

  const handleQuickCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = 'https://ais-pre-3vji7kgnxxo4l5uqgjsucc-629842193563.asia-east1.run.app';
    navigator.clipboard.writeText(url);
    setQuickCopied(true);
    setTimeout(() => setQuickCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#f7f9fb]/90 backdrop-blur-xl border-b border-[#eceef0] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-md bg-[#f2f4f6] rounded-xl px-4 py-2 border border-transparent focus-within:border-[#c6c6cd] transition-all">
        <span className="material-symbols-outlined text-[#76777d] mr-2 text-[20px]">search</span>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-sm text-[#191c1e] placeholder:text-[#76777d]"
          placeholder="Search transactions, categories, vendors..."
          type="text"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="text-xs text-[#76777d] hover:text-[#191c1e]">
            ✕
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Currency Switcher Dropdown */}
        <div className="flex items-center bg-[#f2f4f6] rounded-xl p-1 border border-[#eceef0]">
          {(['USD', 'INR', 'EUR', 'GBP'] as Currency[]).map((cur) => {
            const symbols: Record<Currency, string> = {
              USD: '$ USD',
              INR: '₹ INR',
              EUR: '€ EUR',
              GBP: '£ GBP',
            };
            return (
              <button
                key={cur}
                onClick={() => onCurrencyChange(cur)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  currency === cur
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#76777d] hover:text-[#191c1e]'
                }`}
              >
                {symbols[cur]}
              </button>
            );
          })}
        </div>

        {/* 1-Click Web Site Link Button */}
        <div className="flex items-center">
          <button
            onClick={onOpenShareWeb}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef7f2] hover:bg-[#ddf2e5] border border-[#6cf8bb]/60 text-[#006c49] rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="1-Click Web Site Link & Access"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span className="hidden lg:inline">Web Site</span>
            <span
              onClick={handleQuickCopyLink}
              className="px-1.5 py-0.5 bg-white text-[10px] text-[#006c49] rounded border border-[#6cf8bb] font-bold hover:bg-[#6cf8bb]/20 transition-all ml-0.5"
              title="Click to copy link instantly"
            >
              {quickCopied ? 'Copied! ✓' : '1-Click'}
            </span>
          </button>
        </div>

        {/* Quick Add Expense button */}
        <button
          onClick={onOpenAddExpense}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Entry
        </button>

        {/* Google / Gmail Login Button */}
        <button
          onClick={onOpenGmailLogin}
          className="flex items-center gap-2 bg-white border border-[#dadce0] hover:bg-[#f8fafd] text-[#3c4043] px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all"
          title="Google / Gmail Authentication"
        >
          {/* Google Multi-Color G Icon */}
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 48 48">
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
          <span className="hidden md:inline">
            {currentUser.isLoggedIn ? 'Gmail Active' : 'Gmail Login'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-[#e6e8ea] text-[#45464d] transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#eceef0] p-4 text-xs z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                <span className="font-semibold text-[#191c1e]">Smart Financial Alerts</span>
                <span className="text-[10px] text-[#006c49] font-medium">3 unread</span>
              </div>
              <div className="flex flex-col gap-2.5 mt-2.5">
                <div className="p-2 bg-[#f2f4f6] rounded-lg">
                  <p className="font-medium text-[#191c1e]">Dining Out Saved 14%</p>
                  <p className="text-[#76777d] mt-0.5">Discipline achieved: $60 lower than last month.</p>
                </div>
                <div className="p-2 bg-[#ffdad6]/40 rounded-lg">
                  <p className="font-medium text-[#ba1a1a]">Utility Bills Peak Detected</p>
                  <p className="text-[#76777d] mt-0.5">City Power & Light bill reached $142.50.</p>
                </div>
                <div className="p-2 bg-[#f2f4f6] rounded-lg">
                  <p className="font-medium text-[#191c1e]">Payroll Deposited</p>
                  <p className="text-[#76777d] mt-0.5">Acme Corp Direct Deposit (+$3,850.00) verified.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-[#006c49] transition-all font-semibold text-xs"
            title="User Profile"
          >
            {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#eceef0] p-4 text-xs z-50 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-[#eceef0]">
                <div className="w-10 h-10 rounded-full bg-[#006c49] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#191c1e] truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-[#76777d] truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-[#006c49] font-medium mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
                    Gmail Verified
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenGmailLogin();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#191c1e] hover:bg-[#f2f4f6] flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#0b57d0]">switch_account</span>
                  Switch Gmail Account
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/30 flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

