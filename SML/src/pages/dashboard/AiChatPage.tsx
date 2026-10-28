import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Send,
  RotateCcw,
  Copy,
  Check,
  BellRing,
  BarChart3,
  FileSpreadsheet,
  Paperclip,
  X,
  FileDown,
  Mic,
  Radio
} from 'lucide-react';
import type { ChatMessage, DbDataResponse, ChatResponse, TmcRecord, AnalyzeResponse } from '@/types/ai';
import TelegramAlertModal from '../../components/ai/TelegramAlertModal';
import ExcelTableRenderer from '../../components/ai/ExcelTableRenderer';
import { parseExcelFile, exportJsonToExcel, type ParsedExcelResult } from '@/lib/excelHelper';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';

interface AiChatPageProps {
  dateParam?: string;
  formattedDate?: string;
}

const cleanMarkdownTable = (text: string): string => {
  if (!text) return '';
  // Split merged table rows: whenever '|' is followed by another '|' (e.g. `... || 2 | ...` or `... | | 2 | ...`), split onto a new line
  return text.replace(/\|\s*\|/g, '|\n|');
};

export const AiChatPage: React.FC<AiChatPageProps> = ({
  dateParam = '20260724',
  formattedDate = '24.07.2026',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: `Здравствуйте! Я **AI Аналитик SML** 🤖.

Подключен к базе данных **1С:Предприятие** и оснащен механизмом **обработки таблиц (Excel / CSV)**:
* 📊 **Генерация таблиц 1С:** формирование сводных таблиц остатков, оборотов, выручки и контрагентов в формате Excel с кнопкой скачивания \`.xlsx\`.
* ⏳ **Анализ остатков "Без движения":** выявление неликвидных позиций с указанием филиала, остатка, суммы и дней простоя.
* 📎 **Анализ внешних таблиц:** вы можете загрузить файл \`.xlsx\` или \`.csv\` с помощью кнопки скрепки, и я мгновенно проанализирую строки, суммы и товары.

*Вы можете задавать вопросы на русском или узбекском языке!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dbData, setDbData] = useState<DbDataResponse | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [attachedTable, setAttachedTable] = useState<ParsedExcelResult | null>(null);

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchWithFallback = async (endpoint: string, options?: RequestInit) => {
    const primaryUrl = `/ai-api${endpoint}`;
    const directUrl = `http://localhost:5000/api${endpoint}`;

    try {
      const res = await fetch(primaryUrl, options);
      if (res.ok) return res;
      if (res.status === 404 || res.status >= 500) {
        return await fetch(directUrl, options);
      }
      return res;
    } catch {
      return await fetch(directUrl, options);
    }
  };

  useEffect(() => {
    fetchWithFallback('/data')
      .then((res) => res.json() as Promise<DbDataResponse>)
      .then((data) => setDbData(data))
      .catch((err: unknown) => console.warn('AI bazani yuklash:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelFile(file);
      setAttachedTable(parsed);
      if (!input.trim()) {
        setInput(`Ushbu "${file.name}" jadvalini to'liq tahlil qilib, tovarlar, qoldiqlar, summalar va harakatsiz tovarlar haqida hisobot ber.`);
      }
    } catch (err) {
      console.error('Faylni o\'qishda xatolik:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsgText = attachedTable
      ? `📎 [Прикреплена таблица Excel: "${attachedTable.fileName}" (${attachedTable.rowCount} строк)]\n\n${textToSend.trim()}`
      : textToSend.trim();

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    const tableDataToSend = attachedTable
      ? {
          fileName: attachedTable.fileName,
          rowCount: attachedTable.rowCount,
          columns: attachedTable.columns,
          rows: attachedTable.rows.slice(0, 100),
        }
      : undefined;

    // Faylni bitta so'rov uchun biriktirib, yuborilgandan keyin tozalaymiz
    setAttachedTable(null);

    try {
      const res = await fetchWithFallback('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.slice(-8),
          contextData: {
            selectedDate: formattedDate,
            dateParam: dateParam,
          },
          tableData: tableDataToSend,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errJson.error || `Ошибка сервера: ${res.status}`);
      }

      const data = (await res.json()) as ChatResponse;

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply || 'Не удалось получить ответ.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка подключения к AI';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ **Ошибка сервера:** ${errorMessage}\n\nУбедитесь, что сервер запущен: \`npm run ai:server\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickAnalyze = async () => {
    if (loading || isAnalyzing) return;
    setIsAnalyzing(true);
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: 'Сформируй полный экспресс-отчет по основным показателям 1С в виде структурированной таблицы.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetchWithFallback('/analyze', { method: 'POST' });
      const data = (await res.json()) as AnalyzeResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.report || 'Не удалось сформировать отчет.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка анализа';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ Ошибка: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  const handleExportAllTmcToExcel = () => {
    if (!dbData || !dbData.records || dbData.records.length === 0) return;
    exportJsonToExcel(dbData.records as unknown as Record<string, unknown>[], `SML_TMC_All_Records_${Date.now()}.xlsx`, 'TMC_Qoldiqlar');
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
        text: 'История диалога очищена. Задайте новый вопрос или прикрепите Excel файл.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const records: TmcRecord[] = dbData?.records || [];

  return (
    <div className="w-full flex flex-col font-sans text-slate-100 h-[calc(100vh-100px)] min-h-[600px]">
      {/* Full-width Chat & Conversation Area */}
      <div className="w-full h-full bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Card Header */}
        <div className="bg-[#1e293b] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>AI Аналитик 1С:Предприятие (Таблицы & Диалог)</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                ООО "SIRDARYO MEGA LUKS" • Экспорт таблиц в Excel (.xlsx) включен
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Express Report */}
            <button
              type="button"
              onClick={handleQuickAnalyze}
              disabled={loading || isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Сформировать полный экспресс-отчет 1С"
            >
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">Экспресс-отчет</span>
            </button>

            {/* Export 1C DB to Excel */}
            <button
              type="button"
              onClick={handleExportAllTmcToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Скачать всю базу 1С ТМЦ в формате Excel (.xlsx)"
            >
              <FileDown className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden md:inline">Выгрузить базу 1С</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">.xlsx</span>
            </button>

            {/* Telegram Modal */}
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Настроить Telegram бота"
            >
              <BellRing className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">Telegram</span>
            </button>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={clearChat}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Очистить историю диалога"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Status indicator */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live 1C Tables
              </span>
            </div>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse self-end max-w-[85%]' : 'self-start max-w-[95%]'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1e293b] border border-slate-700 text-blue-400'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div
                    className={`relative rounded-2xl px-5 py-4 text-xs sm:text-sm word-break break-words shadow-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-[#0f172a] border border-slate-800 text-slate-100 rounded-tl-none'
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
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {!isUser && (
                      <button
                        onClick={() => copyText(msg.text, msg.id)}
                        title="Скопировать ответ"
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <span
                    className={`text-[10px] text-slate-500 font-mono px-1 ${
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
            <div className="flex gap-3 self-start max-w-[90%]">
              <div className="w-8 h-8 rounded-xl bg-[#1e293b] border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <span className="text-xs text-slate-300">
                  1С:Предприятие ma'lumotlari tahlil qilinmoqda...
                </span>
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & File Upload Area */}
        <div className="bg-[#1e293b] border-t border-slate-800 p-3 sm:p-4 shrink-0">
          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="mb-2 flex items-center justify-between px-3.5 py-2 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs shadow-lg animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                <Radio className="h-4 w-4 text-rose-400" />
                <span className="font-semibold">
                  {speechLang === 'uz-UZ'
                    ? "Ovoz yozilmoqda... Savolingizni ayting..."
                    : "Слушаю вас... Задайте ваш вопрос..."}
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-900/60 font-mono text-rose-300">
                  {speechLang === 'uz-UZ' ? 'O\'zbekcha' : 'Русский'}
                </span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
              >
                {speechLang === 'uz-UZ' ? "To'xtatish" : "Стоп"}
              </button>
            </div>
          )}

          {/* Attached Table Preview Badge */}
          {attachedTable && (
            <div className="mb-2 flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs shadow-sm">
              <div className="flex items-center gap-2 truncate">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate">{attachedTable.fileName}</span>
                <span className="text-[11px] text-emerald-400/80">({attachedTable.rowCount} строк таблицы)</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedTable(null)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer ml-2"
                title="Удалить прикрепленную таблицу"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isListening) stopListening();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload Excel Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Загрузить файл таблицы Excel или CSV (.xlsx, .csv)"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs font-semibold shrink-0"
            >
              <Paperclip className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Voice Language Toggle (UZ / RU) */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={() => setSpeechLang(speechLang === 'uz-UZ' ? 'ru-RU' : 'uz-UZ')}
                title="Ovoz tilini o'zgartirish (O'zbekcha / Русский)"
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold cursor-pointer transition-colors shrink-0"
              >
                {speechLang === 'uz-UZ' ? 'UZ' : 'RU'}
              </button>
            )}

            {/* Microphone Button */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                title={
                  isListening
                    ? "Ovoz yozishni to'xtatish"
                    : "Ovoz orqali savol kiritish (Mikrofon)"
                }
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-md shadow-rose-900/40 animate-pulse ring-2 ring-rose-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'text-rose-400 animate-bounce' : 'text-sky-400'}`} />
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? (speechLang === 'uz-UZ' ? "Gapiring, AI eshitmoqda..." : "Говорите, AI слушает...")
                  : attachedTable
                  ? `Задайте вопрос по таблице "${attachedTable.fileName}"...`
                  : "Savol bering yoki mikrofondan foydalaning..."
              }
              disabled={loading}
              className="flex-1 bg-[#0f172a] border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <span>Отправить</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Telegram Alert Modal */}
      <TelegramAlertModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        records={records}
      />
    </div>
  );
};

export default AiChatPage;
