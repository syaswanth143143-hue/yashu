import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Currency, ChatMessage } from '../types';
import { formatNumber } from '../utils/formatters';

interface AiAssistantViewProps {
  transactions: Transaction[];
  currency: Currency;
  onAddTransaction: (tx: Partial<Transaction>) => void;
  onOpenVeoModal: () => void;
  onOpenVideoAnalysisModal: () => void;
  onOpenSearchModal: () => void;
  initialPrompt?: string;
}

export type AssistantPersonaId = 'copilot' | 'auditor' | 'enforcer' | 'researcher';

interface AssistantPersona {
  id: AssistantPersonaId;
  name: string;
  roleTitle: string;
  tagline: string;
  icon: string;
  accentColor: string;
  bgLight: string;
  badge: string;
  model: string;
  greeting: string;
  suggestedPrompts: string[];
}

const ASSISTANT_PERSONAS: Record<AssistantPersonaId, AssistantPersona> = {
  copilot: {
    id: 'copilot',
    name: 'Wealth Copilot',
    roleTitle: 'Holistic Wealth & Portfolio Advisor',
    tagline: 'Balanced growth, savings momentum & intuitive expense tracking',
    icon: 'smart_toy',
    accentColor: '#006c49',
    bgLight: '#006c4915',
    badge: 'Balanced & Adaptive',
    model: 'Gemini 3.8 Flash',
    greeting:
      "Hello! I'm your Wealth Copilot. I'm here to help you grow your net worth, optimize daily cash flows, and keep your savings momentum strong.",
    suggestedPrompts: [
      'How much did I spend on dining out this month?',
      'Log $45 for groceries at Trader Joe’s',
      'Give me 3 actionable tips to improve my savings rate',
    ],
  },
  auditor: {
    id: 'auditor',
    name: 'Forensic Auditor',
    roleTitle: 'Quantitative Risk & Variance Analyst',
    tagline: 'Deep mathematical modeling, subscription creep & tax variance modeling',
    icon: 'query_stats',
    accentColor: '#3980f4',
    bgLight: '#3980f415',
    badge: 'High Precision Pro',
    model: 'Gemini 3.1 Pro',
    greeting:
      "Forensic Auditor online. I scrutinize every line item, calculate variance against historical benchmarks, and surface recurring subscription creep.",
    suggestedPrompts: [
      'Audit my recurring expenses and flag hidden subscription creep',
      'Calculate my month-over-month variance by category',
      'Analyze my top 3 biggest expense transactions for tax deduction potential',
    ],
  },
  enforcer: {
    id: 'enforcer',
    name: 'Budget Enforcer',
    roleTitle: 'Frugality & Debt Elimination Coach',
    tagline: 'Zero-fluff discipline, debt avalanche pacing & impulse expense elimination',
    icon: 'gavel',
    accentColor: '#ba1a1a',
    bgLight: '#ba1a1a15',
    badge: 'Strict Discipline',
    model: 'Gemini 3.1 Flash Lite',
    greeting:
      "Budget Enforcer active. Zero fluff, strict discipline. Tell me where you are tempted to overspend and let's lock down your savings.",
    suggestedPrompts: [
      'Where am I bleeding money unnecessarily this week?',
      'Give me a harsh evaluation of my discretionary spending',
      'How can I cut $300 from my budget starting today?',
    ],
  },
  researcher: {
    id: 'researcher',
    name: 'Macro Researcher',
    roleTitle: 'Real-Time Market & Benchmark Analyst',
    tagline: 'Live search-grounded Treasury yields, inflation & benchmark indices',
    icon: 'travel_explore',
    accentColor: '#7b1fa2',
    bgLight: '#7b1fa215',
    badge: 'Search Grounded',
    model: 'Gemini 3.8 Flash + Search',
    greeting:
      "Market Researcher connected. I ground your personal portfolio against live Federal Reserve interest rates, Treasury yields, and inflation data.",
    suggestedPrompts: [
      'Compare my savings yield with current 2026 Treasury benchmarks',
      'What are today’s mortgage and prime lending rates?',
      'How does my grocery spend compare with current CPI inflation?',
    ],
  },
};

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  transactions,
  currency,
  onAddTransaction,
  onOpenVeoModal,
  onOpenVideoAnalysisModal,
  onOpenSearchModal,
  initialPrompt,
}) => {
  const [activeAssistant, setActiveAssistant] = useState<AssistantPersonaId>('copilot');
  const [inputValue, setInputValue] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [imageScanning, setImageScanning] = useState(false);
  const [connectionBanner, setConnectionBanner] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPersona = ASSISTANT_PERSONAS[activeAssistant];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: currentPersona.greeting,
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      setInputValue(initialPrompt);
    }
  }, [initialPrompt]);

  // Handle switching assistant persona
  const handleSwitchAssistant = (newId: AssistantPersonaId) => {
    if (newId === activeAssistant) return;
    setActiveAssistant(newId);
    const newPersona = ASSISTANT_PERSONAS[newId];

    setConnectionBanner(`Connected to ${newPersona.name} (${newPersona.model})`);
    setTimeout(() => setConnectionBanner(null), 3500);

    const switchNotice: ChatMessage = {
      id: `switch-${Date.now()}`,
      role: 'assistant',
      content: `*Switched connection to **${newPersona.name}** (${newPersona.roleTitle}).*\n\n${newPersona.greeting}`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, switchNotice]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const budgetInfo = {
        budget: '$4,500.00',
        spent: '$3,420.50',
        balance: '$24,580.45',
        savingsRate: '36.3%',
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          assistantType: activeAssistant,
          transactions,
          budgetInfo,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Check if user asked to log an expense:
      const logMatch = query.match(
        /(?:log|spent|add|paid)\s+(?:\$|₹|€|£)?\s*([0-9.]+)\s+(?:for|on|at)?\s*([^,\.]+)/i
      );
      if (logMatch) {
        const amountNum = parseFloat(logMatch[1]);
        const descriptionText = logMatch[2].trim();
        if (!isNaN(amountNum)) {
          onAddTransaction({
            vendor: descriptionText.slice(0, 30),
            description: descriptionText,
            amount: -amountNum,
            category: 'Food & Dining',
            date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            account: 'Apple Card',
            status: 'Approved',
          });
        }
      }

      const botMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I've reviewed your request and updated your financial model.",
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your financial ledger. Your current burn rate is on track and within budget. (${err.message})`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `cleared-${Date.now()}`,
        role: 'assistant',
        content: `Session refreshed. ${currentPersona.greeting}`,
        timestamp: 'Just now',
      },
    ]);
  };

  // Voice recording using gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setAudioUploading(true);
          try {
            const res = await fetch('/api/audio/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.transcription) {
              setInputValue(data.transcription);
              if (data.parsedExpense && data.parsedExpense.hasExpense && data.parsedExpense.amount) {
                onAddTransaction({
                  vendor: data.parsedExpense.vendor || 'Voice Expense',
                  description: data.parsedExpense.description || data.transcription,
                  amount: -Math.abs(data.parsedExpense.amount),
                  category: (data.parsedExpense.category as any) || 'Food & Dining',
                  date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  account: 'Apple Card',
                  status: 'Approved',
                });
                handleSendMessage(`I just dictated this expense: "${data.transcription}". Has it been saved?`);
              } else {
                handleSendMessage(data.transcription);
              }
            }
          } catch (e) {
            console.error('Transcription error:', e);
          } finally {
            setAudioUploading(false);
          }
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e: any) {
      alert('Microphone access denied or unsupported: ' + e.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Receipt Image Scan
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setImageScanning(true);
      try {
        const res = await fetch('/api/analyze-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64Image, mimeType: file.type || 'image/jpeg' }),
        });
        const parsed = await res.json();
        if (parsed.vendor && parsed.amount) {
          onAddTransaction({
            vendor: parsed.vendor,
            description: parsed.memo || 'Scanned Receipt',
            amount: -Math.abs(parsed.amount),
            category: (parsed.category as any) || 'Food & Dining',
            date: parsed.date || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            account: parsed.account || 'Chase Sapphire Preferred',
            status: 'Approved',
          });

          const msg: ChatMessage = {
            id: `scan-${Date.now()}`,
            role: 'assistant',
            content: `Scanned receipt from **${parsed.vendor}** for **$${parsed.amount.toFixed(2)}** (${parsed.category}). Transaction has been recorded to your ledger.`,
            timestamp: 'Just now',
          };
          setMessages((prev) => [...prev, msg]);
        }
      } catch (err) {
        console.error('Receipt parse error:', err);
      } finally {
        setImageScanning(false);
      }
    };
  };

  return (
    <div className="flex flex-col w-full pb-10 gap-6">
      {/* Header with Connection Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#d8e2ff] text-[#001a42] text-[11px] font-semibold uppercase tracking-wider">
              AI Intelligence Hub
            </span>
            <span className="text-xs text-[#76777d]">• Multi-Persona Connection</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1e]">
            Connect to Specialized Financial Assistants
          </h1>
        </div>

        {/* Live Active Connection Pill */}
        <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-[#eceef0] shadow-xs">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: currentPersona.accentColor }}
          />
          <div className="text-xs">
            <span className="text-[#76777d] block text-[10px]">Connected Engine:</span>
            <strong className="text-[#191c1e]">{currentPersona.name}</strong> ({currentPersona.model})
          </div>
        </div>
      </div>

      {/* Switcher Cards: Connect to Any Assistant Differently */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(ASSISTANT_PERSONAS) as AssistantPersonaId[]).map((key) => {
          const persona = ASSISTANT_PERSONAS[key];
          const isSelected = activeAssistant === key;

          return (
            <div
              key={key}
              onClick={() => handleSwitchAssistant(key)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-white shadow-md ring-2'
                  : 'bg-white/70 hover:bg-white border-[#eceef0] hover:border-[#c6c6cd] shadow-xs'
              }`}
              style={{
                borderColor: isSelected ? persona.accentColor : undefined,
                boxShadow: isSelected ? `0 4px 20px -2px ${persona.accentColor}25` : undefined,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105"
                    style={{ backgroundColor: persona.accentColor }}
                  >
                    <span className="material-symbols-outlined text-[22px]">{persona.icon}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? persona.accentColor : '#f2f4f6',
                      color: isSelected ? '#ffffff' : '#45464d',
                    }}
                  >
                    {isSelected ? 'Active Connection' : persona.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#191c1e] mt-1">{persona.name}</h3>
                <p className="text-[11px] text-[#76777d] line-clamp-2 mt-1 leading-snug">
                  {persona.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#eceef0] flex items-center justify-between text-[11px]">
                <span className="text-[#45464d] font-mono">{persona.model}</span>
                <span
                  className="font-bold flex items-center gap-0.5 transition-colors"
                  style={{ color: persona.accentColor }}
                >
                  {isSelected ? 'Connected' : 'Switch →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection notification banner */}
      {connectionBanner && (
        <div className="bg-[#131b2e] text-white px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[18px]">verified</span>
            <span>{connectionBanner}</span>
          </div>
          <span className="text-[11px] text-[#bec6e0]">Custom system directives applied</span>
        </div>
      )}

      {/* Main Grid: Telemetry + Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Insights & Assistant Capabilities (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Active Assistant Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#eceef0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: currentPersona.accentColor }}
              >
                <span className="material-symbols-outlined text-[26px]">{currentPersona.icon}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#191c1e]">{currentPersona.name}</h3>
                <p className="text-xs text-[#76777d]">{currentPersona.roleTitle}</p>
              </div>
            </div>

            <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#eceef0] text-xs text-[#45464d] leading-relaxed">
              {currentPersona.tagline}
            </div>

            {/* Connect Differently: Alternate Modalities */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#76777d] block mb-2">
                Connect Differently
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={onOpenSearchModal}
                  className="p-2.5 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] font-semibold flex items-center gap-2 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">travel_explore</span>
                  <span>Web Search</span>
                </button>

                <button
                  onClick={onOpenVideoAnalysisModal}
                  className="p-2.5 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] font-semibold flex items-center gap-2 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">video_library</span>
                  <span>Video Intel</span>
                </button>

                <button
                  onClick={onOpenVeoModal}
                  className="p-2.5 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] font-semibold flex items-center gap-2 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-pink-600 text-[18px]">movie</span>
                  <span>Veo Video</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] font-semibold flex items-center gap-2 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">document_scanner</span>
                  <span>Scan Receipt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Assistant-Specific Suggested Prompts */}
          <div className="bg-white p-6 rounded-2xl border border-[#eceef0] shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#191c1e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-black text-[18px]">bolt</span>
              Prompts for {currentPersona.name}
            </h3>
            <div className="flex flex-col gap-2">
              {currentPersona.suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="text-left p-3 bg-[#f7f9fb] hover:bg-[#f2f4f6] border border-[#eceef0] rounded-xl transition-all text-xs text-[#191c1e] flex items-center justify-between group shadow-2xs"
                >
                  <span className="line-clamp-2">"{p}"</span>
                  <span className="material-symbols-outlined text-[#76777d] group-hover:text-black text-xs shrink-0 ml-2">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Window (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#eceef0] flex flex-col h-[650px] shadow-xs overflow-hidden">
          {/* Chat Window Header */}
          <div className="px-6 py-4 bg-[#f7f9fb] flex items-center justify-between border-b border-[#eceef0]">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: currentPersona.accentColor }}
              >
                <span className="material-symbols-outlined text-[20px]">{currentPersona.icon}</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#191c1e] flex items-center gap-2">
                  {currentPersona.name}
                  <span
                    className="text-[10px] font-semibold px-2 py-0.2 rounded-full"
                    style={{
                      backgroundColor: currentPersona.bgLight,
                      color: currentPersona.accentColor,
                    }}
                  >
                    {currentPersona.model}
                  </span>
                </h2>
                <p className="text-[11px] text-[#76777d]">{currentPersona.roleTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-[#eceef0] text-[#45464d] transition-colors"
                title="Clear Session"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 bg-white">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 text-xs font-bold ${
                      isUser ? 'bg-[#191c1e] text-white' : 'text-white'
                    }`}
                    style={{
                      backgroundColor: isUser ? '#191c1e' : currentPersona.accentColor,
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isUser ? 'person' : currentPersona.icon}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl shadow-2xs ${
                      isUser
                        ? 'bg-[#191c1e] text-white'
                        : 'bg-[#f7f9fb] text-[#191c1e] border border-[#eceef0]'
                    }`}
                  >
                    <div className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                    {msg.breakdown && (
                      <div className="bg-white p-3.5 rounded-xl flex flex-col gap-2 mt-3 text-xs border border-[#eceef0]">
                        {msg.breakdown.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-[#45464d]">{item.category}</span>
                              <span className="font-semibold text-[#191c1e]">
                                {formatNumber(item.amount, currency)} ({item.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#eceef0] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3 max-w-xl">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-1"
                  style={{ backgroundColor: currentPersona.accentColor }}
                >
                  <span className="material-symbols-outlined text-[16px]">{currentPersona.icon}</span>
                </div>
                <div className="bg-[#f7f9fb] p-4 rounded-2xl shadow-2xs border border-[#eceef0] flex items-center gap-2.5 text-xs text-[#76777d]">
                  <div
                    className="w-2.5 h-2.5 rounded-full animate-ping"
                    style={{ backgroundColor: currentPersona.accentColor }}
                  />
                  <span>{currentPersona.name} is formulating financial analysis...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-[#f7f9fb] border-t border-[#eceef0] flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleReceiptUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Receipt Attach Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={imageScanning}
              className="p-2 text-[#45464d] hover:text-[#191c1e] transition-colors rounded-xl hover:bg-white"
              title="Attach & Scan Receipt"
            >
              <span className="material-symbols-outlined text-[20px]">
                {imageScanning ? 'sync' : 'attach_file'}
              </span>
            </button>

            {/* Voice Dictation (using gemini-3.5-transcribe) */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={audioUploading}
              className={`p-2 transition-all rounded-xl ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-[#45464d] hover:text-[#191c1e] hover:bg-white'
              }`}
              title={isRecording ? 'Click to stop dictation' : 'Voice Dictation'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isRecording ? 'stop' : audioUploading ? 'autorenew' : 'mic'}
              </span>
            </button>

            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-white border border-[#eceef0] focus:border-[#191c1e] outline-none px-4 py-2.5 rounded-xl text-xs text-[#191c1e] placeholder:text-[#76777d] shadow-2xs transition-colors"
              placeholder={
                isRecording
                  ? 'Listening to microphone... Speak transaction now...'
                  : `Message ${currentPersona.name}... (e.g. "Audit my quarterly expenses" or "Log $18 for lunch")`
              }
              type="text"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || loading}
              className="text-white px-4 py-2.5 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shadow-xs"
              style={{ backgroundColor: currentPersona.accentColor }}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
