import React, { useState, useEffect } from 'react';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/png');
  const [prompt, setPrompt] = useState('Cinematic smooth camera flythrough animating financial growth and prosperity');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggested Prompts
  const suggestedPrompts = [
    'Cinematic smooth camera flythrough animating financial growth and prosperity',
    'Subtle ambient motion with radiant golden light illuminating portfolio assets',
    'Dynamic futuristic holographic projection of market charts and velocity',
    'Slow motion zoom into luxury architectural investment building',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setVideoUrl(null);
      setErrorMsg(null);
    };
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setVideoUrl(null);
    setStatusMessage('Initiating Veo generation model (veo-3.1-fast-generate-preview)...');

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          mimeType: imageMime,
          prompt,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to start video generation');
      }

      const data = await res.json();
      if (!data.operationName) {
        throw new Error('No operation name returned from video engine');
      }

      setOperationName(data.operationName);
      setStatusMessage('Rendering video frames... AI is interpolating temporal physics (this may take 1-2 minutes).');
    } catch (e: any) {
      console.error('Generation error:', e);
      setErrorMsg(e.message || 'Video generation failed');
      setIsGenerating(false);
    }
  };

  // Poll video status
  useEffect(() => {
    if (!operationName || !isGenerating) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const loadingPhrases = [
        'Analyzing starting frame depth and visual semantics...',
        'Synthesizing cinematic 3D motion paths...',
        'Interpolating fluid temporal vectors and lighting...',
        'Refining high-definition textures at 720p...',
        'Finalizing render encode...',
      ];
      setStatusMessage(loadingPhrases[attempts % loadingPhrases.length]);

      try {
        const statusRes = await fetch('/api/video/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const statusData = await statusRes.json();

        if (statusData.done) {
          clearInterval(interval);
          if (statusData.error) {
            throw new Error(statusData.error.message || 'Model error during video creation');
          }

          setStatusMessage('Generation complete! Downloading video stream...');
          // Download video
          const downloadRes = await fetch('/api/video/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          if (!downloadRes.ok) {
            throw new Error('Failed to fetch generated video');
          }

          const blob = await downloadRes.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setIsGenerating(false);
        }
      } catch (pollErr: any) {
        console.error('Polling error:', pollErr);
        clearInterval(interval);
        setErrorMsg(pollErr.message || 'Error checking video status');
        setIsGenerating(false);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [operationName, isGenerating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2d3133]/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 relative border border-[#eceef0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <span className="material-symbols-outlined text-[20px]">movie</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">Veo Image-to-Video Animator</h3>
              <p className="text-[11px] text-[#76777d]">Powered by Google Veo 3.1 Fast Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#e6e8ea] text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          {/* Upload Image Section */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#191c1e]">Select Starting Image</label>
            <label className="border-2 border-dashed border-[#c6c6cd] rounded-xl p-4 text-center flex flex-col items-center justify-center bg-[#f2f4f6]/50 hover:bg-[#f2f4f6] transition-colors cursor-pointer relative overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isGenerating}
                className="hidden"
              />
              {selectedImage ? (
                <div className="flex items-center gap-4 w-full">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-[#c6c6cd]"
                  />
                  <div className="text-left flex-1">
                    <span className="text-xs font-semibold text-[#191c1e] block">Starting frame loaded</span>
                    <span className="text-[11px] text-[#76777d] block mt-0.5">Click to replace photo</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-purple-600 text-[32px] mb-1">
                    add_photo_alternate
                  </span>
                  <span className="text-xs font-semibold text-[#191c1e]">
                    Upload receipt, asset, or financial goal photo
                  </span>
                  <span className="text-[11px] text-[#76777d] mt-0.5">PNG, JPG, WebP supported</span>
                </>
              )}
            </label>
          </div>

          {/* Aspect Ratio Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#191c1e]">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-[#131b2e] text-white border-[#131b2e]'
                    : 'bg-[#f2f4f6] text-[#45464d] border-[#eceef0] hover:bg-[#e6e8ea]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">crop_16_9</span>
                16:9 (Landscape)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-[#131b2e] text-white border-[#131b2e]'
                    : 'bg-[#f2f4f6] text-[#45464d] border-[#eceef0] hover:bg-[#e6e8ea]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">crop_portrait</span>
                9:16 (Portrait)
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#191c1e]">Animation Prompt</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="bg-[#f2f4f6] rounded-xl p-3 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
              placeholder="Describe how the image should animate..."
            />
          </div>

          {/* Suggested Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[11px] bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#45464d] px-2.5 py-1 rounded-lg transition-colors text-left"
              >
                + {p.slice(0, 38)}...
              </button>
            ))}
          </div>

          {/* Status / Generating indicator */}
          {isGenerating && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 text-xs text-purple-900 font-semibold">
                <span className="material-symbols-outlined text-purple-600 animate-spin text-[20px]">
                  autorenew
                </span>
                <span>Generating Veo Video...</span>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">{statusMessage}</p>
              <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-2/3 animate-pulse rounded-full"></div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Video Player Output */}
          {videoUrl && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-semibold text-[#006c49] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Generated Video Result
              </label>
              <div className="rounded-xl overflow-hidden bg-black shadow-md border border-[#eceef0]">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full max-h-72 object-contain"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href={videoUrl}
                  download="tracker_pro_veo_animation.mp4"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#000000] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download MP4
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#eceef0]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleStartGeneration}
            disabled={isGenerating || !selectedImage}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">movie</span>
            {isGenerating ? 'Rendering...' : 'Animate with Veo'}
          </button>
        </div>
      </div>
    </div>
  );
};
