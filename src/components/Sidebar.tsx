import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenVeoModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenVideoAnalysisModal: () => void;
  onOpenSearchModal: () => void;
  onOpenBudgetModal: () => void;
  currentUser: UserProfile;
  onOpenGmailLogin: () => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenVeoModal,
  onOpenVoiceModal,
  onOpenVideoAnalysisModal,
  onOpenSearchModal,
  onOpenBudgetModal,
  currentUser,
  onOpenGmailLogin,
  alertCount = 0,
}) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#f2f4f6] z-50 flex flex-col pt-8 pb-6 border-r border-[#eceef0] shadow-sm select-none">
      {/* Brand Logo & Name */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#131b2e] flex items-center justify-center p-1 shadow-sm">
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-white fill-none stroke-current" strokeWidth="6">
            <polygon points="50,5 92,26 92,74 50,95 8,74 8,26" stroke="#ffffff" strokeWidth="6" fill="#131b2e" />
            <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" stroke="#4edea3" strokeWidth="5" fill="#191c1e" />
            <circle cx="50" cy="50" r="22" fill="#006c49" stroke="#6cf8bb" strokeWidth="4" />
            <polygon points="50,34 64,42 64,58 50,66 36,58 36,42" fill="#6ffbbe" opacity="0.8" />
          </svg>
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-[#191c1e] block leading-none">Tracker Pro</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#76777d]">Fintech Intelligence</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
          Platform
        </div>

        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center px-4 py-2.5 rounded-xl transition-all text-sm font-medium text-left w-full ${
            currentTab === 'dashboard'
              ? 'bg-[#e6e8ea] text-[#191c1e] font-semibold shadow-xs'
              : 'text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">dashboard</span>
          Dashboard
        </button>

        <button
          onClick={() => onTabChange('expenses')}
          className={`flex items-center px-4 py-2.5 rounded-xl transition-all text-sm font-medium text-left w-full ${
            currentTab === 'expenses'
              ? 'bg-[#e6e8ea] text-[#191c1e] font-semibold shadow-xs'
              : 'text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">receipt_long</span>
          Expenses
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={`flex items-center px-4 py-2.5 rounded-xl transition-all text-sm font-medium text-left w-full ${
            currentTab === 'analytics'
              ? 'bg-[#e6e8ea] text-[#191c1e] font-semibold shadow-xs'
              : 'text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px]">analytics</span>
          Analytics
        </button>

        <button
          onClick={onOpenBudgetModal}
          className="flex items-center px-4 py-2.5 rounded-xl transition-all text-sm font-medium text-left w-full text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e] group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] text-[#006c49]">tune</span>
          Category Budgets
          {alertCount > 0 && (
            <span className="ml-auto text-[10px] bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full font-bold">
              {alertCount} alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('ai-assistant')}
          className={`flex items-center px-4 py-2.5 rounded-xl transition-all text-sm font-medium text-left w-full ${
            currentTab === 'ai-assistant'
              ? 'bg-[#e6e8ea] text-[#191c1e] font-semibold shadow-xs'
              : 'text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined mr-3 text-[20px] text-[#006c49]">smart_toy</span>
          AI Assistant
          <span className="ml-auto text-[10px] bg-[#6cf8bb]/40 text-[#00714d] px-1.5 py-0.5 rounded font-semibold">
            Copilot
          </span>
        </button>

        {/* AI Capabilities Quick Access */}
        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
          Gemini Intelligence
        </div>

        <button
          onClick={onOpenVeoModal}
          className="flex items-center px-4 py-2 rounded-xl text-sm text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e] transition-all text-left w-full group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] text-purple-600 group-hover:scale-110 transition-transform">
            movie
          </span>
          <span>Veo Image to Video</span>
        </button>

        <button
          onClick={onOpenVoiceModal}
          className="flex items-center px-4 py-2 rounded-xl text-sm text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e] transition-all text-left w-full group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] text-blue-600 group-hover:scale-110 transition-transform">
            mic
          </span>
          <span>Voice Transcribe</span>
        </button>

        <button
          onClick={onOpenVideoAnalysisModal}
          className="flex items-center px-4 py-2 rounded-xl text-sm text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e] transition-all text-left w-full group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] text-amber-600 group-hover:scale-110 transition-transform">
            video_library
          </span>
          <span>Video Understanding</span>
        </button>

        <button
          onClick={onOpenSearchModal}
          className="flex items-center px-4 py-2 rounded-xl text-sm text-[#45464d] hover:bg-[#e6e8ea]/60 hover:text-[#191c1e] transition-all text-left w-full group"
        >
          <span className="material-symbols-outlined mr-3 text-[20px] text-emerald-600 group-hover:scale-110 transition-transform">
            travel_explore
          </span>
          <span>Search Grounding</span>
        </button>
      </nav>

      {/* Footer User / Status info */}
      <div className="px-4 pt-4 border-t border-[#eceef0]">
        <div
          onClick={onOpenGmailLogin}
          className="bg-[#ffffff] p-3 rounded-xl shadow-xs flex items-center gap-3 border border-[#eceef0] hover:border-[#c6c6cd] transition-all cursor-pointer group"
          title="Click to switch or log in with Gmail"
        >
          <div className="w-8 h-8 rounded-full bg-[#006c49] flex items-center justify-center text-white text-xs font-bold">
            {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-[#191c1e] truncate group-hover:text-[#0b57d0] transition-colors">
                {currentUser.name}
              </p>
            </div>
            <p className="text-[10px] text-[#76777d] truncate">{currentUser.email}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#006c49]" title="Gmail Connected"></span>
        </div>
      </div>
    </aside>
  );
};
