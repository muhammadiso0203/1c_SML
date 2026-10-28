import dotenv from 'dotenv';
import OpenAI from 'openai';
import { DatabaseResult } from './server.js';

dotenv.config();

export interface LowStockItem {
  name: string;
  quantity: number;
  amount: number;
  unit?: string;
  threshold?: number;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

/**
 * Telegram bot sozlamalarini olish
 */
export function getTelegramConfig(): TelegramConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  };
}

/**
 * Telegram guruh/kanaliga xabar yuborish
 */
export async function sendTelegramMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<{ success: boolean; message?: string; error?: string }> {
  const { botToken, chatId } = getTelegramConfig();

  if (!botToken || !chatId || botToken === 'your_bot_token_here' || chatId === 'your_chat_id_here') {
    return {
      success: false,
      error: ".env faylida TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan!",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
      }),
    });

    const result = (await response.json()) as { ok: boolean; description?: string; result?: unknown };

    if (!result.ok) {
      return {
        success: false,
        error: result.description || 'Telegram xabarini yuborishda xatolik yuz berdi.',
      };
    }

    return {
      success: true,
      message: 'Xabar Telegram guruhiga muvaffaqiyatli yuborildi!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Telegram serveriga ulanishda xatolik: ${errorMsg}`,
    };
  }
}

/**
 * Bazadan kam qolgan mahsulotlarni aniqlash
 * Default bo'yicha: miqdori o'rtacha miqdordan yoki 100 dan kam bo'lgan tovarlar
 */
export function findLowStockItems(db: DatabaseResult, thresholdLimit?: number): LowStockItem[] {
  const records = db.records;
  if (!records || records.length === 0) return [];

  // Agar aniq chegara berilmagan bo'lsa, avtomatik hisoblash
  const quantities = records.map((r) => Number(r.quantity) || 0).filter((q) => q > 0);
  const averageQuantity = quantities.length > 0 ? quantities.reduce((a, b) => a + b, 0) / quantities.length : 100;
  
  // Kam qolgan deb hisoblash chegarasi (yoki 100 kg/birlik, yoki o'rtachaning 20% i)
  const threshold = thresholdLimit !== undefined ? thresholdLimit : Math.min(100, Math.max(30, averageQuantity * 0.2));

  const lowStock: LowStockItem[] = [];

  for (const record of records) {
    const qty = Number(record.quantity) || 0;
    const amt = Number(record.amount) || 0;
    const name = record.GruppaTMC || (record as Record<string, unknown>).name || 'Noma\'lum xom-ashyo';

    // Kam qoldiq deb topilgan tovarlar
    if (qty <= threshold) {
      lowStock.push({
        name: String(name),
        quantity: qty,
        amount: amt,
        threshold,
      });
    }
  }

  // Miqdori bo'yicha eng kamidan boshlab tartiblash
  return lowStock.sort((a, b) => a.quantity - b.quantity);
}

/**
 * AI yordamida kam qolgan tovarlar tahlilini tuzish va Telegram formatida tayyorlash
 */
export async function generateStockAlertReport(
  openai: OpenAI,
  modelName: string,
  db: DatabaseResult,
  lowStockItems: LowStockItem[]
): Promise<string> {
  const dateStr = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

  // Agar AI orqali chuqurroq tavsiya olinishi kerak bo'lsa
  let aiRecommendation = '';
  try {
    const prompt = `Siz korxona ta'minot va ombor bo'yicha ekspert AI siz.
Quyidagi ma'lumotlar bazasida xom-ashyo qoldiqlari kam qolgan tovarlar ro'yxati keltirilgan.
Ushbu kam qolgan mahsulotlar bo'yicha Telegram guruhiga jo'natish uchun qisqa va o'ta aniq 2-3 ta tavsiya (ogohlantirish) bering.

BARCHA BAZA QOLDIG'I:
${db.rawText}

KAM QOLGAN TOVARLAR:
${JSON.stringify(lowStockItems, null, 2)}

TALAB: Javobingizni qisqa, tushunarli, o'zbek tilida yozing. HTML formatida (<b>, <i>, <code> teglaridan foydalanishingiz mumkin).`;

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'Siz ombor va xom-ashyo ta\'minoti bo\'yicha qisqa, aniq va foydali tavsiyalar beruvchi AI botsiz.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    aiRecommendation = completion.choices[0]?.message?.content || '';
  } catch (e) {
    console.error('AI tavsiya yaratishda xatolik:', e);
    aiRecommendation = "<i>AI tavsiyasini yuklab bo'lmadi, zaxirani zudlik bilan to'ldirish tavsiya etiladi.</i>";
  }

  // Chiroyli Telegram HTML shabloni
  let message = `🚨 <b>DIQQAT: KAM QOLGAN XOM-ASHYO VA MAHSULOTLAR HISOBOTI</b>\n`;
  message += `📅 <b>Vaqt:</b> ${dateStr}\n`;
  message += `📊 <b>Jami tekshirilgan guruhlar:</b> ${db.records.length} ta\n`;
  message += `⚠️ <b>Kritik/Kam qolganlar soni:</b> ${lowStockItems.length} ta\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔴 <b>KAM QOLGAN POZITSIYALAR:</b>\n`;

  if (lowStockItems.length === 0) {
    message += `✅ <i>Barcha mahsulotlar zaxirasi yetarli darajada! Kam qolgan tovarlar topilmadi.</i>\n\n`;
  } else {
    lowStockItems.forEach((item, index) => {
      message += `\n<b>${index + 1}. ${item.name}</b>\n`;
      message += `   🔹 Qoldiq: <code>${item.quantity.toLocaleString('uz-UZ')} birlik/kg</code>\n`;
      message += `   🔹 Umumiy summa: <code>${item.amount.toLocaleString('uz-UZ')} so'm</code>\n`;
    });
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  }

  message += `🤖 <b>AI TAHLILI VA TAVSIYASI:</b>\n`;
  message += `${aiRecommendation}\n\n`;
  message += `⚡ <i>AI Agent Boshqaruv Tizimi orqali avtomatik yuborildi</i>`;

  return message;
}

/**
 * Har kuni ertalabki to'liq tahliliy tonggi hisobot shabloni
 */
export async function generateDailyMorningReport(
  openai: OpenAI,
  modelName: string,
  db: DatabaseResult
): Promise<string> {
  const dateStr = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tashkent',
  });

  const lowStockItems = findLowStockItems(db);
  const totalAmount = db.records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalQuantity = db.records.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

  let aiAdvice = '';
  try {
    const prompt = `Siz korxonaning bosh iqtisodchi va ta'minotchi AI tahlilchisisiz.
Bugun ertalabki hisobot uchun korxona rahbariyati va xodimlariga:
1. Ombor holati bo'yicha qisqa umumiy baho (1-2 gap).
2. Bugun birinchi navbatda nimalarga e'tibor qaratish kerak (kam qolgan xom-ashyolar: ${lowStockItems.map(i => i.name).join(', ') || 'mavjud emas'}).
3. Bugungi ish kuni uchun 2 ta aniq ta'minot/ishlab chiqarish tavsiyasi.

MA'LUMOTLAR:
Jami xom-ashyolar: ${totalQuantity.toLocaleString()} birlik
Jami summa: ${totalAmount.toLocaleString()} so'm
Baza:
${db.rawText}

TALAB: O'zbek tilida, xushmuomala, professional, ixcham shaklda yozing. HTML teglari (<b>, <i>, <code>) qo'llang.`;

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'Siz professional ertalabki biznes hisobotlar tayyorlovchi AI yordamchisiz.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    aiAdvice = completion.choices[0]?.message?.content || '';
  } catch (e) {
    console.error('Ertalabki AI hisobotida xatolik:', e);
    aiAdvice = '<i>Ombor qoldiqlari tekshirildi, kam qolgan tovarlarni to\'ldirish choralarini ko\'ring.</i>';
  }

  let msg = `🌅 <b>XAYRLI TONG! KUNLIK TMC VA OMBOR HISOBOTI</b>\n`;
  msg += `📆 <b>Sana:</b> ${dateStr}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `📊 <b>UMUMIY OMBOR BALANSI:</b>\n`;
  msg += `📦 Jami xom-ashyo turlari: <b>${db.records.length} ta guruh</b>\n`;
  msg += `⚖️ Jami zaxira hajmi: <b>${totalQuantity.toLocaleString('uz-UZ')} birlik/kg</b>\n`;
  msg += `💰 Jami balans qiymati: <b>${totalAmount.toLocaleString('uz-UZ')} so'm</b>\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  if (lowStockItems.length > 0) {
    msg += `⚠️ <b>DIQQAT: BUGUN ZUDLIK BILAN BUYURTMA TALAB QILINADIGANLAR (${lowStockItems.length} ta):</b>\n`;
    lowStockItems.forEach((item, idx) => {
      msg += `\n${idx + 1}. <b>${item.name}</b>\n`;
      msg += `   🔴 Qoldiq: <code>${item.quantity.toLocaleString('uz-UZ')}</code> | Qiymati: <code>${item.amount.toLocaleString('uz-UZ')} so'm</code>\n`;
    });
    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  } else {
    msg += `✅ <b>Zaxiralar holati:</b> Barcha xom-ashyolar yetarli darajada ta'minlangan.\n\n`;
  }

  msg += `💡 <b>AI KUNLIK REJA VA TAVSIYALARI:</b>\n`;
  msg += `${aiAdvice}\n\n`;
  msg += `🔔 <i>Har kuni ertalab avtomatik jo'natiluvchi monitoring xabarnomasi.</i>`;

  return msg;
}

