import React, { useState, useEffect } from 'react';
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  Settings,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { TmcRecord } from '../types/database';

interface TelegramAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TmcRecord[];
}

interface TelegramStatus {
  isConfigured: boolean;
  chatId: string | null;
  hasToken: boolean;
}

export default function TelegramAlertModal({
  isOpen,
  onClose,
  records,
}: TelegramAlertModalProps): React.JSX.Element | null {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [sendingAlert, setSendingAlert] = useState<boolean>(false);
  const [testSending, setTestSending] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  
  // Sozlamalar formasi
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Kam qolgan tovarlar
  const lowStockThreshold = 100;
  const lowStockItems = records.filter((r) => Number(r.quantity) <= lowStockThreshold);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setStatus(data);
      if (!data.isConfigured) {
        setShowConfig(true);
      }
    } catch (e) {
      console.error(e);
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
      const res = await fetch('/api/telegram/save-config', {
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
      const res = await fetch('/api/telegram/send-stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: lowStockThreshold }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage({
          type: 'success',
          text: `✅ ${data.message} (${data.lowStockCount} ta kam qolgan pozitsiya tahlil qilindi).`,
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
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
      });
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

  const [sendingMorning, setSendingMorning] = useState<boolean>(false);
  const handleSendMorningReport = async () => {
    setSendingMorning(true);
    setResultMessage(null);
    try {
      const res = await fetch('/api/telegram/send-morning-report', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage({
          type: 'success',
          text: `✅ ${data.message}`,
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
      setSendingMorning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                Telegram Guruhga Ogohlantirish
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Kam qolgan xom-ashyolarni AI tahlili bilan guruhga jo'natish
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                background: showConfig ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem',
                color: showConfig ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
              }}
              title="Sozlamalar"
            >
              <Settings size={15} />
              <span>Sozlash</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Holat Banneri */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: status?.isConfigured
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${
                status?.isConfigured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'
              }`,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {status?.isConfigured ? (
                <ShieldCheck size={18} color="#10b981" />
              ) : (
                <AlertTriangle size={18} color="#ef4444" />
              )}
              <span style={{ fontSize: '0.84rem', color: status?.isConfigured ? '#34d399' : '#f87171' }}>
                {status?.isConfigured
                  ? `Telegram Bot faol ulangan (Guruh: ${status.chatId || 'Ulangan'})`
                  : "Telegram Bot hali ulanmagan. Iltimos, pastda Token va Chat ID kiriting."}
              </span>
            </div>

            {status?.isConfigured && (
              <button
                onClick={handleSendTestMessage}
                disabled={testSending}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  cursor: testSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {testSending ? <RefreshCw size={12} className="spin" /> : <Send size={12} />}
                Test xabar
              </button>
            )}
          </div>

          {/* Xabar / Natija */}
          {resultMessage && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                backgroundColor:
                  resultMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${
                  resultMessage.type === 'success' ? '#10b981' : '#ef4444'
                }`,
                color: resultMessage.type === 'success' ? '#34d399' : '#fca5a5',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {resultMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{resultMessage.text}</span>
            </div>
          )}

          {/* Sozlamalar Formasi */}
          {showConfig && (
            <form
              onSubmit={handleSaveConfig}
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '0.92rem', fontWeight: '600', color: '#93c5fd', marginTop: 0, marginBottom: '0.85rem' }}>
                ⚙️ Telegram Bot va Guruh Sozlamalari
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  1. Telegram Bot Token (@BotFather dan olingan):
                </label>
                <input
                  type="text"
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  2. Telegram Guruh / Kanal Chat ID (masalan: -100123456789):
                </label>
                <input
                  type="text"
                  placeholder="-100..."
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: savingConfig ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {savingConfig ? <RefreshCw size={14} className="spin" /> : null}
                  Saqlash
                </button>
              </div>
            </form>
          )}

          {/* Kam qolgan tovarlar ro'yxati */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="#f59e0b" />
                <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#f8fafc' }}>
                  Zaxirada kam qolgan pozitsiyalar ({lowStockItems.length} ta)
                </h4>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Chegara: ≤ {lowStockThreshold} birlik
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {lowStockItems.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                  Barcha tovarlar zaxirasi yetarli darajada!
                </div>
              ) : (
                lowStockItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#fca5a5' }}>
                        {item.GruppaTMC}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        Qiymati: {Number(item.amount).toLocaleString()} so'm
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                      }}
                    >
                      {Number(item.quantity).toLocaleString()} birlik
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Avtomatik Jadval Statusi */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⏰</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#93c5fd' }}>
                  Avtomatik Tonggi Hisobot Rejimi: Faol
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Har kuni ertalab soat 09:00 da (Toshkent vaqti) guruhga avtomatik hisobot yuboriladi
                </div>
              </div>
            </div>

            <button
              onClick={handleSendMorningReport}
              disabled={sendingMorning || !status?.isConfigured}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: '600',
                cursor: status?.isConfigured && !sendingMorning ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
              }}
              title="Tonggi hisobotni hoziroq sinab ko'rish"
            >
              {sendingMorning ? <RefreshCw size={12} className="spin" /> : <span>🌅</span>}
              <span>Tonggi hisobotni sinash</span>
            </button>
          </div>

          {/* AI Ogohlantirish tugmasi */}
          <button
            onClick={handleSendStockAlert}
            disabled={sendingAlert || !status?.isConfigured}
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              background: status?.isConfigured
                ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.92rem',
              cursor: status?.isConfigured && !sendingAlert ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: status?.isConfigured
                ? '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {sendingAlert ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>AI tahlil qilmoqda va Telegramga yubormoqda...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Kam qolganlarni zudlik bilan tekshirish va jo'natish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

