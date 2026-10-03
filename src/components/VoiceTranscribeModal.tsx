import React, { useState, useRef } from 'react';
import { Transaction } from '../types';

interface VoiceTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Partial<Transaction>) => void;
}

export const VoiceTranscribeModal: React.FC<VoiceTranscribeModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState('audio/webm');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [parsedExpense, setParsedExpense] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioMime('audio/webm');

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg('Microphone permission required: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioMime(file.type || 'audio/mp3');
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
      setTranscription(null);
      setParsedExpense(null);
    };
  };

  const handleTranscribe = async () => {
    if (!audioBase64 || isTranscribing) return;

    setIsTranscribing(true);
    setErrorMsg(null);
    setTranscription(null);
    setParsedExpense(null);

    try {
      const res = await fetch('/api/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: audioBase64,
          mimeType: audioMime,
        }),
      });

      if (!res.ok) {
        throw new Error('Transcription request failed');
      }

      const data = await res.json();
      setTranscription(data.transcription);
      setParsedExpense(data.parsedExpense);
    } catch (err: any) {
      console.error('Audio transcription error:', err);
      setErrorMsg(err.message || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAddExtractedExpense = () => {
    if (!parsedExpense) return;
    onAddTransaction({
      vendor: parsedExpense.vendor || 'Voice Entry',
      description: parsedExpense.description || transcription || 'Voice Logged',
      amount: -Math.abs(parsedExpense.amount || 25),
      category: parsedExpense.category || 'Food & Dining',
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      account: 'Apple Card',
      status: 'Approved',
      icon: 'mic',
    });
    alert('Voice expense successfully logged into ledger!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2d3133]/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden p-6 relative border border-[#eceef0] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <span className="material-symbols-outlined text-[20px]">speech_to_text</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">Audio Transcription</h3>
              <p className="text-[11px] text-[#76777d]">Powered by Gemini 3.5 Transcribe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#e6e8ea] text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Record or Upload Controls */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#f2f4f6] rounded-xl p-5 flex flex-col items-center justify-center text-center gap-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse scale-110'
                  : 'bg-[#000000] text-white hover:opacity-90'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {isRecording ? 'stop' : 'mic'}
              </span>
            </button>
            <div>
              <div className="text-xs font-semibold text-[#191c1e]">
                {isRecording ? 'Listening... Speak your expense memo now' : 'Click microphone to record'}
              </div>
              <div className="text-[11px] text-[#76777d] mt-0.5">
                Example: "Spent forty dollars on groceries at Trader Joe's"
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-[#76777d] font-medium">— or —</div>

          <label className="border border-dashed border-[#c6c6cd] rounded-xl p-3 text-center flex items-center justify-center gap-2 bg-white hover:bg-[#f2f4f6] transition-colors cursor-pointer text-xs font-medium text-[#191c1e]">
            <span className="material-symbols-outlined text-[18px] text-[#76777d]">upload_file</span>
            <span>Upload audio file (MP3, WAV, WebM)</span>
            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
          </label>

          {/* Audio Player */}
          {audioUrl && (
            <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#eceef0] flex items-center justify-between">
              <audio src={audioUrl} controls className="w-full h-8" />
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {isTranscribing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-xs text-blue-900 font-medium">
              <span className="material-symbols-outlined text-blue-600 animate-spin text-[18px]">
                sync
              </span>
              Gemini 3.5 Transcribe is analyzing audio stream...
            </div>
          )}

          {/* Results */}
          {transcription && (
            <div className="bg-[#f7f9fb] border border-[#eceef0] rounded-xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#eceef0]">
                <span className="text-xs font-bold text-[#191c1e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">notes</span>
                  Verbatim Transcription
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-[#191c1e] leading-relaxed italic">"{transcription}"</p>

              {parsedExpense && parsedExpense.hasExpense && (
                <div className="bg-white p-3 rounded-lg border border-[#eceef0] flex items-center justify-between mt-1">
                  <div>
                    <div className="text-xs font-bold text-[#191c1e]">
                      {parsedExpense.vendor} • ${parsedExpense.amount}
                    </div>
                    <div className="text-[11px] text-[#76777d]">
                      Category: {parsedExpense.category}
                    </div>
                  </div>
                  <button
                    onClick={handleAddExtractedExpense}
                    className="px-3 py-1.5 bg-[#006c49] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    Save to Ledger
                  </button>
                </div>
              )}
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
            onClick={handleTranscribe}
            disabled={!audioBase64 || isTranscribing}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">transcribe</span>
            {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
          </button>
        </div>
      </div>
    </div>
  );
};
