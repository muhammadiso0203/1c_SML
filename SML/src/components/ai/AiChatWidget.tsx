import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Send,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  BellRing,
  RotateCcw,
  Mic,
  Radio
} from 'lucide-react';
import type { ChatMessage, DbDataResponse, ChatResponse, TmcRecord } from '@/types/ai';
import TelegramAlertModal from './TelegramAlertModal';
import ExcelTableRenderer from './ExcelTableRenderer';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';

interface AiChatWidgetProps {
  externalOpen?: boolean;
  onToggle?: (open: boolean) => void;
  dashboardContext?: Record<string, unknown>;
}

export const OPEN_AI_CHAT_EVENT = 'open-sml-ai-chat';

const cleanMarkdownTable = (text: string): string => {
  if (!text) return '';
  // Split merged table rows: whenever '|' is followed by another '|' (e.g. `... || 2 | ...` or `... | | 2 | ...`), split onto a new line
  return text.replace(/\|\s*\|/g, '|\n|');
};

export default function AiChatWidget({
  externalOpen,
  onToggle,
  dashboardContext
}: AiChatWidgetProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Assalomu alaykum! Men **SML AI Tahlilchi Agentiman** 🤖.\n\nDashboard ko'rsatkichlari, 1C ma'lumotlari, xom-ashyo (TMC) qoldiqlari, summalar yoki tavsiyalar bo'yicha istalgan savolingizni berishingiz mumkin!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dbData, setDbData] = useState<DbDataResponse | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    lang: speechLang,
    setLang: setSpeechLang,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    defaultLang: 'uz-UZ',
    onResult: (transcriptText) => {
      setInput(transcriptText);
    },
  });

  // External open control or custom event
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  useEffect(() => {
    const handleCustomOpen = () => {
      setIsOpen(true);
      setShowTooltip(false);
    };
    window.addEventListener(OPEN_AI_CHAT_EVENT, handleCustomOpen);
    return () => window.removeEventListener(OPEN_AI_CHAT_EVENT, handleCustomOpen);
  }, []);

  const setChatOpen = (open: boolean) => {
    setIsOpen(open);
    if (onToggle) onToggle(open);
  };

  // Helper for API base with fallback
  const fetchWithFallback = async (endpoint: string, options?: RequestInit) => {
    const primaryUrl = `/ai-api${endpoint}`;
    const directUrl = `http://localhost:5000/api${endpoint}`;

    try {
      const res = await fetch(primaryUrl, options);
      if (res.ok) return res;
      // If 404 or 502/504 on proxy, attempt direct
      if (res.status === 404 || res.status >= 500) {
        return await fetch(directUrl, options);
      }
      return res;
    } catch {
      // Network failure, fallback to direct port 5000
      return await fetch(directUrl, options);
    }
  };

  // Load database TMC records
  useEffect(() => {
    fetchWithFallback('/data')
      .then((res) => res.json() as Promise<DbDataResponse>)
      .then((data) => setDbData(data))
      .catch((err: unknown) => console.warn("AI bazani yuklash (server offline bo'lishi mumkin):", err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetchWithFallback('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          contextData: dashboardContext,
        }),
      });

      const data = (await res.json()) as ChatResponse;
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: data.reply!,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || 'Serverdan javob olib bo\'lmadi');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ **AI Serverga ulanishda xatolik:** ${errorMessage}\n\nAI server ishga tushirilganligini tekshiring:\n\`\`\`bash\nnpm run ai:server\n\`\`\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: "Suhbat tarixi tozalandi. Yangi savolingizni berishingiz mumkin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickQuestions = [
    { label: "📊 Umumiy tahlil", query: "Barcha xom-ashyo qoldiqlarini tahlil qilib, umumiy hisobot ber" },
    { label: "⚠️ Kam qolganlar", query: "Qaysi xom-ashyolar qoldig'i kam qolgan va xavfli holatda?" },
    { label: "💰 Qoldiqlar summasi", query: "Ombordagi xom-ashyolarning jami summasi qancha va eng kattasi qaysi?" },
    { label: "💡 Tavsiyalar", query: "Ishlab chiqarish va xom-ashyo ta'minoti bo'yicha qanday tavsiyalar berasiz?" },
  ];

  const records: TmcRecord[] = dbData?.records || [];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] font-sans">
        {/* Chat Modal / Popup */}
        {isOpen && (
          <div
            className={`chat-popup-enter fixed bottom-[90px] right-6 ${
              isExpanded ? 'w-[680px] h-[720px]' : 'w-[400px] h-[580px]'
            } max-w-[calc(100vw-32px)] max-h-[calc(100vh-110px)] bg-[#0c1220]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.25)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">SML AI Yordamchi</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {dbData?.totalRecords ? `${dbData.totalRecords} ta TMC guruhi ulangan` : '1C & Dashboard AI Agenti'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsTelegramModalOpen(true)}
                  title="Telegramga ogohlantirish"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <BellRing size={15} />
                </button>
                <button
                  onClick={clearChat}
                  title="Tarixni tozalash"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Kichraytirish" : "Kattalashtirish"}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  onClick={() => setChatOpen(false)}
                  title="Yopish"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090d16]/90">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'flex-row-reverse self-end max-w-[85%]' : 'self-start max-w-[92%]'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 border border-slate-700 text-blue-400'
                      }`}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div
                        className={`relative rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm word-break break-words shadow-sm ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {!isUser ? (
                          <div className="markdown-body">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{ table: ExcelTableRenderer }}
                            >
                              {cleanMarkdownTable(msg.text)}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        )}

                        {!isUser && (
                          <button
                            onClick={() => copyText(msg.text, msg.id)}
                            title="Nusxa olish"
                            className="absolute top-2 right-2 p-1 rounded bg-slate-900/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>

                      <span
                        className={`text-[10px] text-slate-500 px-1 ${
                          isUser ? 'self-end' : 'self-start'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2.5 self-start">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-3.5 py-2 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">AI tahlil qilmoqda</span>
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <div className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick chips */}
            <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickQuestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            {isListening && (
              <div className="px-3 py-1.5 bg-rose-950/90 border-t border-rose-500/50 flex items-center justify-between text-xs text-rose-200 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <Radio size={13} className="text-rose-400" />
                  <span className="font-semibold text-[11px]">
                    {speechLang === 'uz-UZ' ? "Tinglanmoqda... Gapiring..." : "Слушаю вас..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                >
                  {speechLang === 'uz-UZ' ? "To'xtatish" : "Стоп"}
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isListening) stopListening();
                handleSendMessage();
              }}
              className="p-2.5 sm:p-3 bg-[#0c1220] border-t border-slate-800 flex items-center gap-1.5"
            >
              {/* Language toggle (UZ / RU) */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => setSpeechLang(speechLang === 'uz-UZ' ? 'ru-RU' : 'uz-UZ')}
                  title="Ovoz tilini tanlash (UZ / RU)"
                  className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                >
                  {speechLang === 'uz-UZ' ? 'UZ' : 'RU'}
                </button>
              )}

              {/* Microphone Button */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Ovoz yozishni to'xtatish" : "Ovoz bilan savol berish (Mikrofon)"}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Mic size={15} className={isListening ? 'text-rose-400' : 'text-sky-400'} />
                </button>
              )}

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? (speechLang === 'uz-UZ' ? "Gapiring, AI eshitmoqda..." : "Говорите...")
                    : "AI'ga savol bering..."
                }
                disabled={loading}
                className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Floating Action Button (FAB) */}
        <div className="flex items-center gap-3">
          {!isOpen && showTooltip && (
            <div
              onClick={() => {
                setChatOpen(true);
                setShowTooltip(false);
              }}
              className="bg-slate-900/95 backdrop-blur-md border border-blue-500/40 rounded-xl px-3.5 py-2 shadow-xl shadow-black/50 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              <Sparkles size={15} className="text-blue-400 animate-pulse" />
              <span className="text-xs text-slate-200 font-medium">
                AI'ga savol bering
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-500 hover:text-slate-300 ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setChatOpen(!isOpen);
              setShowTooltip(false);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/30 border-2 border-white/20 transition-all duration-300 cursor-pointer ${
              isOpen
                ? 'bg-slate-800 hover:bg-slate-700 rotate-90'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 fab-glow'
            }`}
            title="SML AI Agent"
          >
            {isOpen ? <X size={24} /> : <Bot size={28} />}
          </button>
        </div>
      </div>

      {/* Telegram Alert Modal */}
      <TelegramAlertModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        records={records}
      />
    </>
  );
}
