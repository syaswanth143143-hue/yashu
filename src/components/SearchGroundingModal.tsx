import React, { useState } from 'react';

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('Current 2026 US Treasury yields, inflation rates, and average savings APY');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleQueries = [
    'Current 2026 US Treasury yields, inflation rates, and average savings APY',
    'Benchmark 30-year fixed mortgage rates today',
    'Average US household dining out expenditure vs groceries in 2026',
    'Leading high-yield cash management accounts and APY comparison',
  ];

  const handleSearch = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResultText(null);
    setSources([]);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (data.text) {
        setResultText(data.text);
        setSources(data.sources || []);
      } else if (!res.ok) {
        throw new Error(data.error || `Search failed with status ${res.status}`);
      }
    } catch (err: any) {
      console.warn('Search Grounding caught exception:', err);
      setErrorMsg(err.message || 'Unable to complete search request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2d3133]/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 relative border border-[#eceef0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-[20px]">travel_explore</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">Google Search Grounding</h3>
              <p className="text-[11px] text-[#76777d]">Powered by Gemini 3.8 Flash & Google Search tool</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#e6e8ea] text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#191c1e]">Financial Research Query</label>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Ask about live rates, macroeconomic indicators, market benchmarks..."
                className="flex-1 bg-[#f2f4f6] rounded-xl px-4 py-2.5 text-xs text-[#191c1e] border border-transparent focus:border-[#006c49] outline-none"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                className="px-4 py-2.5 bg-[#006c49] text-white rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                Ground
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="text-[11px] bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#45464d] px-2.5 py-1 rounded-lg transition-colors text-left"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#006c49] animate-spin text-[22px]">
                progress_activity
              </span>
              <div className="text-xs text-emerald-950 font-medium">
                Querying Google Search & analyzing market intelligence...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Grounded Response */}
          {resultText && (
            <div className="bg-[#f7f9fb] border border-[#eceef0] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                <span className="text-xs font-bold text-[#191c1e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#006c49] text-[18px]">verified</span>
                  Search Grounded Analysis
                </span>
                <span className="text-[10px] text-[#006c49] font-medium bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full">
                  Verified Data
                </span>
              </div>
              <div className="text-xs text-[#191c1e] leading-relaxed whitespace-pre-wrap">
                {resultText}
              </div>

              {/* Source citations */}
              {sources.length > 0 && (
                <div className="pt-3 border-t border-[#eceef0]">
                  <span className="text-[11px] font-semibold text-[#45464d] block mb-2">
                    Verified Google Search Web Citations:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {sources.map((src, idx) => {
                      const uri = src.web?.uri;
                      const title = src.web?.title || uri;
                      if (!uri) return null;
                      return (
                        <a
                          key={idx}
                          href={uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#006c49] hover:underline flex items-center gap-1.5 truncate"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          <span className="truncate">{title}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#eceef0]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
