import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  User,
  Send,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { ChatMessage, DbDataResponse, ChatResponse } from '../types/database';

export default function AiChatWidget(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Assalomu alaykum! Men sizning **TMC va Baza Tahlilchi AI Agentingizman**.\n\nBazadagi xom-ashyo qoldiqlari, summalar yoki tavsiyalar bo'yicha istalgan savolingizni berishingiz mumkin!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dbData, setDbData] = useState<DbDataResponse | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Bazadagi ma'lumotlarni yuklash
  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json() as Promise<DbDataResponse>)
      .then((data) => setDbData(data))
      .catch((err: unknown) => console.error("Bazani yuklashda xatolik:", err));
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
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
        throw new Error(data.error || 'Xatolik yuz berdi');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik yuz berdi';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ **Xatolik:** ${errorMessage}\n\nIltimos, \`.env\` faylida OpenAI API kaliti borligini tekshiring.`,
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

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'var(--font-sans)' }}>
      
      {/* 1. POPUP CHAT OYNASI */}
      {isOpen && (
        <div
          className="chat-popup-enter"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: isExpanded ? '640px' : '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: isExpanded ? '720px' : '560px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.9rem 1.1rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
                }}
              >
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                    TMC AI Yordamchi
                  </h3>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                  {dbData?.totalRecords ? `${dbData.totalRecords} ta TMC guruhi ulangan` : 'Baza yuklanmoqda...'}
                </p>
              </div>
            </div>

            {/* Boshqaruv tugmalari */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={clearChat}
                title="Tarixni tozalash"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Kichiklashtirish" : "Kattalashtirish"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Yopish"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Xabarlari */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              background: '#090e1a',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '0.6rem',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '85%' : '92%',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isUser ? '#2563eb' : '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {isUser ? <User size={14} color="#fff" /> : <Bot size={14} color="#60a5fa" />}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div
                      style={{
                        background: isUser ? '#2563eb' : 'rgba(30, 41, 59, 0.85)',
                        border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: '0.75rem 0.95rem',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        position: 'relative',
                        wordBreak: 'break-word',
                      }}
                    >
                      {!isUser ? (
                        <div className="markdown-body" style={{ fontSize: '0.88rem' }}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.text}</p>
                      )}

                      {!isUser && (
                        <button
                          onClick={() => copyText(msg.text, msg.id)}
                          title="Nusxalash"
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: 'none',
                            color: '#94a3b8',
                            padding: '3px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedId === msg.id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: '#64748b',
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        padding: '0 4px',
                      }}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '0.6rem', alignSelf: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={14} color="#60a5fa" />
                </div>
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.85)',
                    borderRadius: '14px 14px 14px 2px',
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>AI o'ylamoqda</span>
                  <div className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa' }} />
                  <div className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa' }} />
                  <div className="typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Tezkor savol chiplari */}
          <div
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(15, 23, 42, 0.7)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
          </div>

          {/* Input qatori */}
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.75rem',
              background: '#0d1322',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Savolingizni yozing..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.55rem 0.85rem',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: input.trim() && !loading ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* 2. BURCHAKDAGI FLOATING AI TUGMASI (FAB) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        
        {/* Tooltip taklif xabari */}
        {!isOpen && showTooltip && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'floatBadge 3s ease-in-out infinite',
              cursor: 'pointer',
            }}
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
          >
            <Sparkles size={15} color="#60a5fa" />
            <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '500' }}>
              TMC bazasi bo'yicha savolingiz bormi?
            </span>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 2px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* AI FAB TUGMASI */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={!isOpen ? 'fab-glow' : ''}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isOpen
              ? '#1e293b'
              : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.45)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
          title="AI Tahlilchi Chat"
        >
          {isOpen ? <X size={26} /> : <Bot size={28} />}
        </button>
      </div>

    </div>
  );
}
