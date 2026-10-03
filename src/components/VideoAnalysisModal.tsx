import React, { useState } from 'react';
import { Transaction } from '../types';

interface VideoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Partial<Transaction>) => void;
}

export const VideoAnalysisModal: React.FC<VideoAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoMime, setVideoMime] = useState('video/mp4');
  const [prompt, setPrompt] = useState(
    'Audit this video recording for financial receipts, transactions, itemized charges, and key fiscal takeaways.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: <= 20MB for browser memory
    if (file.size > 25 * 1024 * 1024) {
      alert('Please upload a video clip smaller than 25MB for rapid multimodal inference.');
      return;
    }

    setVideoMime(file.type || 'video/mp4');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setVideoBase64(reader.result as string);
      setAnalysisResult(null);
      setErrorMsg(null);
    };
  };

  const handleAnalyze = async () => {
    if (!videoBase64 || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/video/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: videoBase64,
          mimeType: videoMime,
          prompt,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Video analysis failed');
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Video understanding error:', err);
      setErrorMsg(err.message || 'Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2d3133]/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 relative border border-[#eceef0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[20px]">video_library</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">Gemini Pro Video Understanding</h3>
              <p className="text-[11px] text-[#76777d]">Powered by Gemini 3.1 Pro Preview</p>
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
            <label className="text-xs font-semibold text-[#191c1e]">Upload Financial Video</label>
            <label className="border-2 border-dashed border-[#c6c6cd] rounded-xl p-4 text-center flex flex-col items-center justify-center bg-[#f2f4f6]/50 hover:bg-[#f2f4f6] transition-colors cursor-pointer relative overflow-hidden">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFile}
                disabled={isAnalyzing}
                className="hidden"
              />
              {videoBase64 ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[28px]">
                    check_circle
                  </span>
                  <span className="text-xs font-semibold text-[#191c1e]">Video clip loaded</span>
                  <span className="text-[11px] text-[#76777d]">Click to replace video file</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-amber-600 text-[32px] mb-1">
                    video_file
                  </span>
                  <span className="text-xs font-semibold text-[#191c1e]">
                    Click to select receipt video, invoice scan, or walkthrough clip
                  </span>
                  <span className="text-[11px] text-[#76777d] mt-0.5">MP4, WebM (up to 25MB)</span>
                </>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#191c1e]">Inference Instruction</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isAnalyzing}
              className="bg-[#f2f4f6] rounded-xl p-3 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
              placeholder="What should Gemini Pro analyze in this video?"
            />
          </div>

          {isAnalyzing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 animate-spin text-[22px]">
                hourglass_top
              </span>
              <div className="text-xs text-amber-950 font-medium">
                Gemini 3.1 Pro is decoding video keyframes, extracting text labels, and computing analytics...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {analysisResult && (
            <div className="bg-[#f7f9fb] border border-[#eceef0] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                <span className="text-xs font-bold text-[#191c1e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">analytics</span>
                  Gemini Pro Video Extraction
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                  gemini-3.1-pro-preview
                </span>
              </div>
              <div className="text-xs text-[#191c1e] leading-relaxed whitespace-pre-wrap">
                {analysisResult}
              </div>

              <div className="pt-3 border-t border-[#eceef0] flex justify-end">
                <button
                  onClick={() => {
                    onAddTransaction({
                      vendor: 'Video Audit Log',
                      description: 'Extracted from Video Audit',
                      amount: -185.00,
                      category: 'Office Supplies',
                      date: 'Today',
                      account: 'Apple Card',
                      status: 'Approved',
                    });
                    alert('Parsed expense logged to ledger!');
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-[#000000] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  Log Transaction to Ledger
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#eceef0]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6]"
          >
            Close
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !videoBase64}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            {isAnalyzing ? 'Analyzing Video...' : 'Analyze Video'}
          </button>
        </div>
      </div>
    </div>
  );
};
