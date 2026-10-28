import React, { useState, useEffect } from 'react';
import AiChatWidget from './components/AiChatWidget';
import TelegramAlertModal from './components/TelegramAlertModal';
import {
  Boxes,
  DollarSign,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  Search,
  Send
} from 'lucide-react';
import { DbDataResponse, TmcRecord } from './types/database';

export default function App(): React.JSX.Element {
  const [dbData, setDbData] = useState<DbDataResponse | null>(null);
  const [search, setSearch] = useState<string>('');
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json() as Promise<DbDataResponse>)
      .then((d) => setDbData(d))
      .catch((e: unknown) => console.error(e));
  }, []);

  const records: TmcRecord[] = dbData?.records || [];
  const totalAmount: number = records.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalQuantity: number = records.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  const filteredRecords: TmcRecord[] = records.filter((r) =>
    (r.GruppaTMC || '').toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = records.filter((r) => Number(r.quantity) <= 100).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', overflowY: 'auto' }}>
      
      {/* 1. Yuqori Navigatsiya */}
      <nav
        style={{
          padding: '1.1rem 2rem',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Layers size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              Korxona TMC Boshqaruv Paneli
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Xom-ashyo qoldiqlari va sun'iy intellekt tahlil tizimi
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Telegram Guruhga Yuborish Tugmasi */}
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '0.45rem 0.95rem',
              borderRadius: '999px',
              fontWeight: '700',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(2, 132, 199, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Send size={14} />
            <span>Telegram Ogohlantirish</span>
            {lowStockCount > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                }}
              >
                {lowStockCount}
              </span>
            )}
          </button>

          <span
            style={{
              fontSize: '0.78rem',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
            database.json ulangan ({records.length} ta guruh)
          </span>
        </div>
      </nav>

      {/* 2. Asosiy Dashboard Tarkibi */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(88, 28, 135, 0.3) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Sparkles size={18} color="#60a5fa" />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI & Telegram Avtomatik Nazorati
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
              Kam qolgan mahsulotlarni tekshiring va Telegram guruhga yuboring
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '650px' }}>
              AI tizimi barcha xom-ashyolar zaxirasini tahlil qiladi va kam qolgan tovarlar bo'yicha Telegram guruhingizga zudlik bilan rasmiy tahliliy hisobot yuboradi.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
              }}
            >
              <Send size={16} />
              <span>Guruhga Ogohlantirish Jo'natish</span>
            </button>
          </div>
        </div>


        {/* 3. Ko'rsatkich Kartalari (Stats Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>JAMI XARAJAT / QIYMAT</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#34d399" />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399', letterSpacing: '-0.02em' }}>
              {totalAmount.toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8' }}>so'm</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
              Barcha 8 ta TMC guruhi bo'yicha jami
            </div>
          </div>

          <div
            style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>JAMI MIQDOR (OB'YOM)</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Boxes size={20} color="#60a5fa" />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#60a5fa', letterSpacing: '-0.02em' }}>
              {totalQuantity.toLocaleString('uz-UZ', { maximumFractionDigits: 2 })} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#94a3b8' }}>birlik</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
              Xom-ashyolarning umumiy og'irligi/hajmi
            </div>
          </div>

          <div
            style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>ENG YUQORI ULUSH (LIDER)</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="#c084fc" />
              </div>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#c084fc' }}>
              ПП - Полипропилен
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem' }}>
              31,305,135 so'm (~43.5% umumiy byudjet)
            </div>
          </div>

        </div>

        {/* 4. Jadval Bo'limi */}
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileSpreadsheet size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
                Xom-ashyo (TMC) guruhi bo'yicha taqsimot
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.35rem 0.75rem', gap: '0.5rem' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Guruh nomi bo'yicha qidirish..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: '220px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>T/R</th>
                  <th style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>TMC Guruhi Nomi</th>
                  <th style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'right' }}>Miqdor</th>
                  <th style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'right' }}>Summa (so'm)</th>
                  <th style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'right' }}>Ulush (%)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item, idx) => {
                  const percentage = totalAmount > 0 ? ((Number(item.amount) / totalAmount) * 100).toFixed(1) : '0';
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1.5rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.85rem 1.5rem', color: '#ffffff', fontWeight: '600' }}>
                        {item.GruppaTMC}
                      </td>
                      <td style={{ padding: '0.85rem 1.5rem', color: '#94a3b8', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {Number(item.quantity).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 1.5rem', color: '#34d399', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        {Number(item.amount).toLocaleString('uz-UZ', { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 1.5rem', textAlign: 'right' }}>
                        <span
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.82rem',
                          }}
                        >
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 5. BURCHAKDAGI FLOATING AI POPUP CHAT WIDGET */}
      <AiChatWidget />

      {/* 6. TELEGRAM OGOHLANTIRISH MODAL OYNASI */}
      <TelegramAlertModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        records={records}
      />

    </div>
  );
}

