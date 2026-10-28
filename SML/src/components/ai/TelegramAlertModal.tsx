import React, { useState, useEffect } from 'react';
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  Settings,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Sun
} from 'lucide-react';
import type { TmcRecord, TelegramStatus } from '@/types/ai';

interface TelegramAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TmcRecord[];
}

export default function TelegramAlertModal({
  isOpen,
  onClose,
  records,
}: TelegramAlertModalProps): React.JSX.Element | null {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [sendingAlert, setSendingAlert] = useState<boolean>(false);
  const [testSending, setTestSending] = useState<boolean>(false);
  const [sendingMorning, setSendingMorning] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  const lowStockThreshold = 100;
  const lowStockItems = records.filter((r) => Number(r.quantity) <= lowStockThreshold);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const getApiUrl = (endpoint: string) => {
    return `/ai-api${endpoint}`;
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/telegram/status'));
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (!data.isConfigured) {
          setShowConfig(true);
        }
      }
    } catch (e) {
      console.error('Telegram status olishda xatolik:', e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken || !chatId) {
      setResultMessage({ type: 'error', text: 'Iltimos, Bot Token va Chat ID ni kiriting!' });
      return;
    }

    setSavingConfig(true);
    setResultMessage(null);
    try {
      const res = await fetch(getApiUrl('/telegram/save-config'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage({ type: 'success', text: "Telegram sozlamalari muvaffaqiyatli saqlandi!" });
        setShowConfig(false);
        fetchStatus();
      } else {
        setResultMessage({ type: 'error', text: data.error || 'Saqlashda xatolik!' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResultMessage({ type: 'error', text: msg });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendStockAlert = async () => {
    setSendingAlert(true);
    setResultMessage(null);
    try {
      const res = await fetch(getApiUrl('/telegram/send-stock-alert'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: lowStockThreshold }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage({
          type: 'success',
          text: `✅ ${data.message} (${data.lowStockCount || 0} ta kam qolgan tovar tahlil qilindi).`,
        });
      } else {
        setResultMessage({
          type: 'error',
          text: `❌ Xatolik: ${data.error || 'Yuborib bo\'lmadi'}`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResultMessage({ type: 'error', text: msg });
    } finally {
      setSendingAlert(false);
    }
  };

  const handleSendTestMessage = async () => {
    setTestSending(true);
    setResultMessage(null);
    try {
      const res = await fetch(getApiUrl('/telegram/test'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResultMessage({ type: 'success', text: '✅ ' + data.message });
      } else {
        setResultMessage({ type: 'error', text: '❌ Xatolik: ' + (data.error || 'Test xabari bormadi.') });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResultMessage({ type: 'error', text: msg });
    } finally {
      setTestSending(false);
    }
  };

  const handleSendMorningReport = async () => {
    setSendingMorning(true);
    setResultMessage(null);
    try {
      const res = await fetch(getApiUrl('/telegram/send-morning-report'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResultMessage({ type: 'success', text: `✅ ${data.message}` });
      } else {
        setResultMessage({ type: 'error', text: `❌ Xatolik: ${data.error || 'Yuborib bo\'lmadi'}` });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResultMessage({ type: 'error', text: msg });
    } finally {
      setSendingMorning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-blue-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Send size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Telegram Guruhga Ogohlantirish</h2>
              <p className="text-xs text-slate-400">Kam qolgan xom-ashyolarni AI tahlili bilan guruhga jo'natish</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                showConfig
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings size={14} />
              <span>Sozlash</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              status?.isConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {status?.isConfigured ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
              <span>
                {status?.isConfigured
                  ? `Telegram Bot faol ulangan (Guruh: ${status.chatId || 'Ulangan'})`
                  : "Telegram Bot hali to'liq ulanmagan. Iltimos, Sozlash tugmasi orqali Token va Guruh ID kiriting."}
              </span>
            </div>

            {status?.isConfigured && (
              <button
                onClick={handleSendTestMessage}
                disabled={testSending}
                className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700 flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {testSending ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                Test xabar
              </button>
            )}
          </div>

          {resultMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500 text-rose-300'
              }`}
            >
              {resultMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{resultMessage.text}</span>
            </div>
          )}

          {/* Config Form */}
          {showConfig && (
            <form
              onSubmit={handleSaveConfig}
              className="p-4 bg-slate-900/70 border border-slate-700/60 rounded-xl space-y-3"
            >
              <h3 className="text-xs font-semibold text-blue-300">⚙️ Telegram Bot va Guruh Sozlamalari</h3>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  1. Telegram Bot Token (@BotFather dan olingan):
                </label>
                <input
                  type="text"
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  2. Telegram Guruh / Kanal Chat ID (masalan: -100123456789):
                </label>
                <input
                  type="text"
                  placeholder="-100123456789"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  {savingConfig ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
                  <AlertTriangle size={15} />
                  <span>Kam Qolgan Mahsulotlar</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Qoldig'i 100 tadan kam bo'lgan xom-ashyolar ({lowStockItems.length} ta) ro'yxatini AI xulosasi bilan
                  guruhga jo'natadi.
                </p>
              </div>
              <button
                onClick={handleSendStockAlert}
                disabled={sendingAlert || !status?.isConfigured}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer"
              >
                {sendingAlert ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Ogohlantirish Jo'natish</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
                  <Sun size={15} />
                  <span>Kunlik Tonggi Hisobot</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Avtomatik 09:00 da ketadigan to'liq umumiy holat hisobotini hozir zudlik bilan guruhga jo'natadi.
                </p>
              </div>
              <button
                onClick={handleSendMorningReport}
                disabled={sendingMorning || !status?.isConfigured}
                className="w-full py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
              >
                {sendingMorning ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Tonggi Hisobotni Yuborish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

