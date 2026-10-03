import React, { useState } from 'react';

interface ShareWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareWebModal: React.FC<ShareWebModalProps> = ({ isOpen, onClose }) => {
  const defaultSharedUrl = 'https://ais-pre-3vji7kgnxxo4l5uqgjsucc-629842193563.asia-east1.run.app';
  const devUrl = 'https://ais-dev-3vji7kgnxxo4l5uqgjsucc-629842193563.asia-east1.run.app';

  // Get active web URL dynamically if available
  const activeUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : defaultSharedUrl;

  const [inputUrl, setInputUrl] = useState(activeUrl);
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedType(type);
    setTimeout(() => {
      setCopied(false);
      setCopiedType(null);
    }, 2000);
  };

  const handleOpenOneClick = (urlToOpen: string) => {
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
  };

  const handleShareApi = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Personal Expenses Tracker Pro - AI Financial Platform',
          text: 'Check out Personal Expenses Tracker Pro:',
          url: inputUrl,
        });
      } catch (err) {
        console.log('Share canceled or not supported', err);
      }
    } else {
      handleCopy(inputUrl, 'main');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#eceef0] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eceef0] flex items-center justify-between bg-gradient-to-r from-[#f7f9fb] to-[#eef2f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006c49] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">language</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                Personal Expenses Tracker Pro
                <span className="text-[10px] bg-[#6cf8bb]/40 text-[#00714d] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live & Shared
                </span>
              </h2>
              <p className="text-xs text-[#76777d]">One-click link to launch, share, or embed this web application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#76777d] hover:bg-[#e6e8ea] hover:text-[#191c1e] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 text-sm">
          {/* Public Access Banner */}
          <div className="bg-[#eef7f2] border border-[#6cf8bb] p-3 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-[#006c49] text-[22px]">public</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#006c49]">Public Access Granted to Everyone</p>
              <p className="text-[11px] text-[#00714d]">
                Anyone who receives this website link can immediately open and view the dashboard, expenses, budget tracking, and charts without any login or setup required.
              </p>
            </div>
          </div>

          {/* Main 1-Click Action Card */}
          <div className="p-4 rounded-xl bg-[#f2f4f6] border border-[#eceef0] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#191c1e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#006c49]">link</span>
                Web Site Link (Type or Edit below):
              </label>
              <span className="text-[11px] text-[#006c49] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006c49] animate-ping"></span>
                Active Public URL
              </span>
            </div>

            {/* Editable / Typeable Web Link Input */}
            <div className="flex items-center bg-white rounded-xl border border-[#dadce0] focus-within:border-[#006c49] focus-within:ring-1 focus-within:ring-[#006c49] transition-all px-3 py-2 shadow-2xs">
              <span className="text-xs text-[#76777d] select-none mr-1.5 font-mono">https://</span>
              <input
                type="text"
                value={inputUrl.replace(/^https?:\/\//, '')}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputUrl(val.startsWith('http') ? val : `https://${val}`);
                }}
                className="w-full text-xs font-mono text-[#191c1e] bg-transparent outline-none"
                placeholder="type web address here..."
              />
            </div>

            {/* 1-Click Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* One click copy */}
              <button
                onClick={() => handleCopy(inputUrl, 'input')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                  copied && copiedType === 'input'
                    ? 'bg-[#006c49] text-white'
                    : 'bg-[#191c1e] hover:bg-[#2c3034] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied && copiedType === 'input' ? 'check' : 'content_copy'}
                </span>
                {copied && copiedType === 'input' ? 'Copied in 1 Click!' : '1-Click Copy Link'}
              </button>

              {/* One click open */}
              <button
                onClick={() => handleOpenOneClick(inputUrl)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs bg-[#006c49] hover:bg-[#005237] text-white transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                1-Click Open Web
              </button>
            </div>
          </div>

          {/* Quick Access Verified Web Links */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#45464d] uppercase tracking-wider">
              Permanent Web Links
            </span>

            {/* Shared Public App */}
            <div className="p-3 bg-white rounded-xl border border-[#eceef0] hover:border-[#c6c6cd] transition-all flex items-center justify-between gap-3 shadow-2xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#191c1e]">Shared Web App (Production)</span>
                  <span className="text-[10px] bg-[#eef7f2] text-[#006c49] font-semibold px-2 py-0.2 rounded">
                    Universal
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#76777d] truncate mt-0.5 select-all">
                  {defaultSharedUrl}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(defaultSharedUrl, 'prod')}
                  className="px-2.5 py-1.5 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Copy shared link"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied && copiedType === 'prod' ? 'check' : 'content_copy'}
                  </span>
                  {copied && copiedType === 'prod' ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={defaultSharedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-[#eef7f2] hover:bg-[#ddf2e5] text-[#006c49] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Open shared web in new tab"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Open
                </a>
              </div>
            </div>

            {/* Development Live App */}
            <div className="p-3 bg-white rounded-xl border border-[#eceef0] hover:border-[#c6c6cd] transition-all flex items-center justify-between gap-3 shadow-2xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#191c1e]">Development Web App</span>
                  <span className="text-[10px] bg-[#f2f4f6] text-[#45464d] font-semibold px-2 py-0.2 rounded">
                    Live Dev
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#76777d] truncate mt-0.5 select-all">
                  {devUrl}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(devUrl, 'dev')}
                  className="px-2.5 py-1.5 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Copy dev link"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied && copiedType === 'dev' ? 'check' : 'content_copy'}
                  </span>
                  {copied && copiedType === 'dev' ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={devUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Open dev web in new tab"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Open
                </a>
              </div>
            </div>
          </div>

          {/* Quick Share Feature */}
          <div className="flex items-center justify-between pt-2 border-t border-[#eceef0]">
            <button
              onClick={handleShareApi}
              className="text-xs text-[#0b57d0] hover:underline font-semibold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share Web Link via System App
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
