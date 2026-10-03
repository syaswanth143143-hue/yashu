import React, { useState } from 'react';
import { Transaction, Currency } from '../types';
import { CURRENCIES } from '../data/initialData';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Partial<Transaction>) => void;
  currency: Currency;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  currency,
}) => {
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<any>('Food & Dining');
  const [account, setAccount] = useState('Chase Sapphire Preferred');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState('');
  const [scanning, setScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const currentCurrencySymbol = CURRENCIES[currency]?.symbol || '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount) return;

    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt)) return;

    onAddTransaction({
      vendor,
      description: memo || `${category} Expense`,
      memo,
      amount: -Math.abs(parsedAmt),
      category,
      account,
      date: date || 'Today',
      status: 'Approved',
      icon: category === 'Food & Dining' ? 'restaurant' : category === 'Transport' ? 'directions_car' : category === 'Technology' ? 'cloud' : 'receipt',
    });

    onClose();
    // Reset
    setVendor('');
    setAmount('');
    setMemo('');
  };

  // Handle receipt image upload & scan
  const handleReceiptFile = async (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setScanning(true);
      try {
        const res = await fetch('/api/analyze-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64Image, mimeType: file.type || 'image/jpeg' }),
        });
        const parsed = await res.json();
        if (parsed.vendor) setVendor(parsed.vendor);
        if (parsed.amount) setAmount(String(parsed.amount));
        if (parsed.category) setCategory(parsed.category);
        if (parsed.memo) setMemo(parsed.memo);
        if (parsed.date) setDate(parsed.date);
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setScanning(false);
      }
    };
  };

  // Handle voice input with MediaRecorder
  const toggleVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      setIsListening(true);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        setIsListening(false);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setScanning(true);
          try {
            const res = await fetch('/api/audio/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.parsedExpense) {
              if (data.parsedExpense.vendor) setVendor(data.parsedExpense.vendor);
              if (data.parsedExpense.amount) setAmount(String(data.parsedExpense.amount));
              if (data.parsedExpense.category) setCategory(data.parsedExpense.category);
              if (data.parsedExpense.description) setMemo(data.parsedExpense.description);
            } else if (data.transcription) {
              setMemo(data.transcription);
            }
          } catch (e) {
            console.error('Voice dictation error:', e);
          } finally {
            setScanning(false);
          }
        };
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 5000);
    } catch (e: any) {
      alert('Microphone error: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2d3133]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 relative border border-[#eceef0]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#eceef0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#131b2e] text-[18px]">receipt</span>
            </div>
            <h3 className="text-base font-bold text-[#191c1e]">Add New Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#e6e8ea] text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">Vendor / Merchant</label>
              <input
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
                className="bg-[#f2f4f6] rounded-xl px-3.5 py-2 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
                placeholder="e.g. Amazon, Whole Foods"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">Amount</label>
              <div className="flex items-center bg-[#f2f4f6] rounded-xl px-3.5 py-1.5 border border-transparent focus-within:border-[#000000]">
                <span className="text-xs font-bold text-[#45464d] mr-1">{currentCurrencySymbol}</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  className="bg-transparent border-none outline-none w-full text-sm font-semibold text-[#191c1e]"
                  placeholder="0.00"
                  type="number"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#f2f4f6] rounded-xl px-3 py-2 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Housing & Utilities">Housing & Utilities</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Technology">Technology</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Marketing">Marketing</option>
                <option value="Travel">Travel</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="bg-[#f2f4f6] rounded-xl px-3 py-2 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
              >
                <option value="Chase Sapphire Preferred">Chase Sapphire Preferred</option>
                <option value="Apple Card">Apple Card</option>
                <option value="Wells Fargo Checking">Wells Fargo Checking</option>
                <option value="Corporate Amex">Corporate Amex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">Date</label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#f2f4f6] rounded-xl px-3 py-2 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
                type="date"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">Reference / Memo</label>
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="bg-[#f2f4f6] rounded-xl px-3.5 py-2 text-xs text-[#191c1e] border border-transparent focus:border-[#000000] outline-none"
                placeholder="Invoice # or description"
                type="text"
              />
            </div>
          </div>

          {/* AI Receipt Scanning Dropzone & Voice Dictation */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#191c1e]">
                AI Auto-Extraction (Receipt / Voice)
              </label>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">mic</span>
                {isListening ? 'Recording voice (5s)...' : 'Dictate with Voice'}
              </button>
            </div>

            <label className="border-2 border-dashed border-[#c6c6cd] rounded-xl p-4 text-center flex flex-col items-center justify-center bg-[#f2f4f6]/50 hover:bg-[#f2f4f6] transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleReceiptFile(e.target.files[0]);
                }}
                className="hidden"
              />
              {scanning ? (
                <div className="flex items-center gap-2 text-xs text-[#006c49] font-medium py-2">
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Gemini Flash is parsing receipt text and metadata...
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#76777d] text-[26px] mb-1">
                    cloud_upload
                  </span>
                  <span className="text-xs font-semibold text-[#191c1e]">
                    Click to scan receipt with Gemini AI
                  </span>
                  <span className="text-[11px] text-[#76777d] mt-0.5">
                    PNG, JPG, WebP (auto-fills vendor, amount & category)
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#eceef0]">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#000000] text-white hover:opacity-90 transition-opacity shadow-xs"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
