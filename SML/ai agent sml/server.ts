import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import {
  findLowStockItems,
  generateStockAlertReport,
  generateDailyMorningReport,
  getTelegramConfig,
  sendTelegramMessage,
} from './telegram.js';
import { buildMultiEndpointContext } from './oneCService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// OpenAI sozlash
const apiKey = process.env.OPENAI_API_KEY;
const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const openai = new OpenAI({ apiKey: apiKey || 'dummy_key' });

export interface TmcRecord {
  GruppaTMC: string;
  quantity: number | string;
  amount: number | string;
  [key: string]: unknown;
}

export interface DatabaseResult {
  raw: unknown;
  records: TmcRecord[];
  rawText: string;
}

export interface ChatHistoryItem {
  id?: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp?: string;
}

/**
 * database.json ma'lumotlarini yuklash
 */
export function getDatabase(): DatabaseResult {
  const jsonPath = path.join(__dirname, 'data', 'database.json');
  if (!fs.existsSync(jsonPath)) {
    return { raw: [], records: [], rawText: '[]' };
  }
  try {
    const rawContent = fs.readFileSync(jsonPath, 'utf8');
    const parsed: unknown = JSON.parse(rawContent);

    let records: TmcRecord[] = [];
    if (Array.isArray(parsed)) {
      records = parsed as TmcRecord[];
    } else if (parsed && typeof parsed === 'object' && 'data' in parsed && Array.isArray((parsed as { data: unknown }).data)) {
      records = (parsed as { data: TmcRecord[] }).data;
    } else if (parsed && typeof parsed === 'object') {
      records = [parsed as TmcRecord];
    }

    return {
      raw: parsed,
      records,
      rawText: rawContent,
    };
  } catch (err: unknown) {
    console.error('Xatolik:', err);
    return { raw: [], records: [], rawText: '[]' };
  }
}

// 1. Bazadagi ma'lumotlarni olish
app.get('/api/data', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json({
    success: true,
    totalRecords: db.records.length,
    records: db.records,
    raw: db.raw,
  });
});

// 2. Chat endpointi
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      contextData,
      tableData,
    }: {
      message?: string;
      history?: ChatHistoryItem[];
      contextData?: unknown;
      tableData?: unknown;
    } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Xabar kiritilmadi' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
      return res.status(400).json({
        error: '.env faylida to\'g\'ri OPENAI_API_KEY kiritilmagan.',
      });
    }

    const db = getDatabase();

    // 1C:Enterprise AIIntegration: oldingi savollar konteksti bilan birga mos endpointlardan ma'lumot olish
    const userHistoryText = (history || [])
      .filter((m) => m.sender === 'user')
      .slice(-3)
      .map((m) => m.text)
      .join(' ');
    const combinedQuery = `${userHistoryText} ${message}`.trim();
    const { contextText: live1CSection, usedEndpoints } = await buildMultiEndpointContext(combinedQuery || message);
    console.log(`[AI Query] Savol: "${message}" (Kontekst: "${combinedQuery.slice(0, 80)}") -> Ishlatilgan endpointlar:`, usedEndpoints);

    const systemPrompt = `Siz SML korxonasi, uning 1C ma'lumotlar bazasi (TMC / xom-ashyo, mahsulotlar, qoldiqlar, summalar, aylanmalar, sarf-xarajatlar va tahlillar) bo'yicha professional AI Yordamchisiz.

QOIDALAR:
1. TIL VA MOSLASHUVCHANLIK (UZBEK & RUSSIAN BILINGUAL SUPPORT):
   - Siz O'ZBEK va RUS tillarida birdek mukammal tushunasiz va javob berasiz.
   - Foydalanuvchi qaysi tilda yozsa, javobni QAT'IY O'SHA TILDA bering!
     * Agar savol RUS tilida bo'lsa -> Butun javob 100% toza RUS tilida bo'lsin. Salomlashish: "Здравствуйте!". Hech qanday o'zbekcha so'z (masalan: "Assalomu alaykum", "xom-ashyo", "qoldiq", valyuta esa "сум") ishlatmang!
     * Agar savol O'ZBEK tilida bo'lsa -> Butun javob 100% toza O'ZBEK tilida bo'lsin. Salomlashish: "Assalomu alaykum!". Valyuta: "so'm".
   - Agar foydalanuvchi ingliz tilida yozsa, ingliz tilida javob bering.
2. Korxona xom-ashyolari, qoldiqlar, aylanmalar, kirim-chiqimlar, summalar, foizlar va hisob-kitoblar bo'yicha berilgan barcha savollarga quyidagi ma'lumotlar bazasiga tayangan holda aniq javob bering.
3. Agar foydalanuvchi mutlaqo mavzudan tashqari begona narsalar haqida so'rasa, xushmuomalalik bilan rad javob bering.
4. Javoblarni tushunarli, aniq va chiroyli Markdown formatida taqdim eting.
5. QAT'IY QOIDA: 1C dan kelgan xom JSON ma'lumotlarni to'g'ridan-to'g'ri ekranga yoki chatga chiqarmang! Ularni faqat tahlil qiling va faqat foydalanuvchi so'ragan aniq ko'rsatkichlar hamda xulosalarni bering.
6. JADVALLAR VA EXCEL BILAN ISHLASH (MUHIM QOIDALAR):
   - QAT'IYAN TAQIQLANADI: "Hozirda Excel jadvalini to'g'ridan-to'g'ri yaratish imkoniyatim yo'q", "men fayl yarata olmayman" yoki shunga o'xshash bahonalarni ASLO YOZMANG!
   - BIZNING VEB ILOVA SIZ CHIQARGAN HAR BIR MARKDOWN JADVALINI AVTOMATIK TARZDA INTERAKTIV EXCEL JADVALIGA AYLANTIRADI VA UNGA [📥 Скачать .xlsx] TUGMASINI QO'YADI.
   - Foydalanuvchi "excel jadval", "jadval ko'rinishida", "jadval qilib ber", "harakatsiz tovarlar jadvali", "daromad va xarajat jadvali" deb so'rasa, darhol to'liq va toza Markdown jadvali ko'rinishida javob bering.
   - QAT'IY FORMAT TALABI: Jadvalning HAR BIR QATORI ALOHIDA YANGI QATORDAN (\\n) boshlanishi SHART!
     Hech qachon bir qatorga \`||---|---|| 1 | ...\` qilib ulab yozmang! Har doim alohida qatorda:
     | № | Ko'rsatkich / Tovar | Qiymat / Qoldiq | Summa (so'm) | Harakatsiz kunlar / Izoh |
     |---|---------------------|-----------------|--------------|--------------------------|
     | 1 | BRAIBANTI ...        | 2 dona          | 12 240       | 214 kun                  |
     | 2 | BRAIBANTI ...        | 4 dona          | 14 960       | 214 kun                  |
   - Agar tovarlar yoki harakatsiz tovarlar jadvali so'ralsa:
     | № | Товар / Материал | Филиал / Склад | Остаток | Сумма (сум) | Без движения / Примечание |
   - Agar daromad va xarajatlar bo'yicha jadval so'ralsa, 1C bazadan olingan tushum, tannarx, foyda, xarajatlar va rentabellikni aniq raqamlar bilan jadvalga tering.
   - Agar foydalanuvchi Excel jadval (.xlsx/.csv) yuklagan bo'lsa, o'sha jadval ustunlarini to'liq tahlil qiling, jami summasini hisoblang, harakatsiz turgan tovarlarni alohida ko'rsating va biznes uchun aniq tavsiyalar bering.

1C BAZA VA KO'RSATKICHLAR:
${live1CSection ? live1CSection : '```json\n' + db.rawText + '\n```'}
${contextData ? `\n\nDASHBOARD METRIKALARI:\n\`\`\`json\n${JSON.stringify(contextData, null, 2)}\n\`\`\`` : ''}
${tableData ? `\n\nFOYDALANUVCHI YUKLAGAN EXCEL JADVALI (ПОЛЬЗОВАТЕЛЬСКАЯ ТАБЛИЦА):\n\`\`\`json\n${JSON.stringify(tableData, null, 2)}\n\`\`\`` : ''}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((m): OpenAI.Chat.ChatCompletionMessageParam => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || 'Javob olib bo\'lmadi.';

    res.json({
      success: true,
      reply,
    });
  } catch (error: unknown) {
    console.error('AI Chat Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI so\'rovini bajarishda xatolik yuz berdi.';
    res.status(500).json({
      error: errorMessage,
    });
  }
});

// 3. Tezkor tahlil hisoboti
app.post('/api/analyze', async (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { contextText: liveContext } = await buildMultiEndpointContext('Umumiy hisobot va qoldiqlar hamda aylanmalar tahlili');
    const systemPrompt = `Siz professional Data Analyst agentsiz.
Quyidagi ma'lumotlar bazasi bo'yicha to'liq va mukammal tahliliy hisobot tayyorlang:
1. 📊 Umumiy xulosa (Jami miqdor, jami summa, eng katta ulushga ega xom-ashyolar).
2. 📈 Asosiy ko'rsatkichlar tahlili va taqsimoti.
3. ⚠️ Muammolar / Chiqindi (Отходы) yoki nomutanosibliklar tahlili.
4. 💡 Biznes / Ishlab chiqarish uchun 3 ta aniq tavsiya.

O'zbek tilida, professional, chiroyli Markdown bilan yozing.

BAZA:
${liveContext ? liveContext : '```json\n' + db.rawText + '\n```'}`;

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Ma\'lumotlar bazasini to\'liq tahlil qilib, hisobot bering.' },
      ],
      temperature: 0.3,
    });

    res.json({
      success: true,
      report: completion.choices[0]?.message?.content,
    });
  } catch (error: unknown) {
    console.error('Analysis Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Tahlil qilishda xatolik yuz berdi.';
    res.status(500).json({ error: errorMessage });
  }
});

// 4. Telegram Holatini olish
app.get('/api/telegram/status', (_req: Request, res: Response) => {
  const { botToken, chatId } = getTelegramConfig();
  const isConfigured = Boolean(
    botToken &&
    chatId &&
    botToken !== 'your_bot_token_here' &&
    chatId !== 'your_chat_id_here'
  );

  res.json({
    success: true,
    isConfigured,
    chatId: chatId ? `${chatId.slice(0, 4)}...${chatId.slice(-3)}` : null,
    hasToken: Boolean(botToken && botToken !== 'your_bot_token_here'),
  });
});

// 5. Telegram sozlamalarini saqlash (.env ga yangilash)
app.post('/api/telegram/save-config', (req: Request, res: Response) => {
  try {
    const { botToken, chatId } = req.body;
    if (!botToken || !chatId) {
      return res.status(400).json({ error: 'Bot Token va Chat ID kiritilishi shart.' });
    }

    process.env.TELEGRAM_BOT_TOKEN = botToken.trim();
    process.env.TELEGRAM_CHAT_ID = chatId.trim();

    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (envContent.includes('TELEGRAM_BOT_TOKEN=')) {
      envContent = envContent.replace(/TELEGRAM_BOT_TOKEN=.*/g, `TELEGRAM_BOT_TOKEN=${botToken.trim()}`);
    } else {
      envContent += `\nTELEGRAM_BOT_TOKEN=${botToken.trim()}`;
    }

    if (envContent.includes('TELEGRAM_CHAT_ID=')) {
      envContent = envContent.replace(/TELEGRAM_CHAT_ID=.*/g, `TELEGRAM_CHAT_ID=${chatId.trim()}`);
    } else {
      envContent += `\nTELEGRAM_CHAT_ID=${chatId.trim()}`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    res.json({
      success: true,
      message: 'Telegram sozlamalari muvaffaqiyatli saqlandi!',
    });
  } catch (err: unknown) {
    console.error('Config save error:', err);
    res.status(500).json({ error: 'Sozlamalarni saqlashda xatolik yuz berdi.' });
  }
});

// 6. Kam qolgan tovarlarni AI orqali tekshirish va Telegram guruhga yuborish
app.post('/api/telegram/send-stock-alert', async (req: Request, res: Response) => {
  try {
    const { threshold } = req.body;
    const db = getDatabase();

    // 1. Kam qolganlarni aniqlash
    const lowStockItems = findLowStockItems(db, threshold ? Number(threshold) : undefined);

    // 2. AI yordamida Telegram hisobotini generatsiya qilish
    const reportText = await generateStockAlertReport(openai, modelName, db, lowStockItems);

    // 3. Telegram guruhiga jo'natish
    const tgResult = await sendTelegramMessage(reportText, 'HTML');

    if (!tgResult.success) {
      return res.status(400).json({
        success: false,
        error: tgResult.error,
        reportText,
        lowStockItems,
      });
    }

    res.json({
      success: true,
      message: 'Kam qolgan mahsulotlar hisoboti Telegram guruhiga jo\'natildi!',
      lowStockCount: lowStockItems.length,
      lowStockItems,
      reportText,
    });
  } catch (err: unknown) {
    console.error('Telegram alert error:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// 7. Telegramga test xabar jo'natish
app.post('/api/telegram/test', async (_req: Request, res: Response) => {
  try {
    const testMsg = `🤖 <b>AI Agent Tizimidan Test Xabari!</b>\n\n✅ Telegram Bot va Guruh muvaffaqiyatli ulandi!\nEndi mahsulotlar kam qolganda ogohlantirishlar shu yerga keladi.`;
    const result = await sendTelegramMessage(testMsg, 'HTML');

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Test xabari guruhga yuborildi!' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// 8. Kunlik tonggi hisobotni zudlik bilan qo'lda jo'natish
app.post('/api/telegram/send-morning-report', async (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const morningReport = await generateDailyMorningReport(openai, modelName, db);
    const tgResult = await sendTelegramMessage(morningReport, 'HTML');

    if (!tgResult.success) {
      return res.status(400).json({
        success: false,
        error: tgResult.error,
        reportText: morningReport,
      });
    }

    res.json({
      success: true,
      message: 'Kunlik tonggi hisobot Telegram guruhiga jo\'natildi!',
      reportText: morningReport,
    });
  } catch (err: unknown) {
    console.error('Morning report error:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// ==========================================
// ⏰ AVTOMATIK JONATISh (CRON SCHEDULER)
// Har kuni ertalab soat 09:00 da (Toshkent vaqti)
// ==========================================
const DAILY_CRON_EXPRESSION = process.env.DAILY_REPORT_CRON || '0 9 * * *';

cron.schedule(DAILY_CRON_EXPRESSION, async () => {
  console.log('⏰ [CRON] Kunlik ertalabki hisobotni avtomatik jo\'natish boshlandi (09:00 Asia/Tashkent)...');
  try {
    const db = getDatabase();
    const morningReport = await generateDailyMorningReport(openai, modelName, db);
    const result = await sendTelegramMessage(morningReport, 'HTML');
    if (result.success) {
      console.log('✅ [CRON] Kunlik ertalabki hisobot muvaffaqiyatli Telegram guruhiga jo\'natildi!');
    } else {
      console.warn('⚠️ [CRON] Telegramga yuborib bo\'lmadi:', result.error);
    }
  } catch (cronError: unknown) {
    console.error('❌ [CRON] Avtomatik hisobot yaratishda xatolik:', cronError);
  }
}, {
  timezone: 'Asia/Tashkent',
});

console.log(`⏰ Avtomatik tonggi hisobot jadvali: [${DAILY_CRON_EXPRESSION}] (Toshkent vaqti bilan har kuni ertalab 09:00 da)`);

app.listen(PORT, () => {
  console.log(`🚀 Backend API server http://localhost:${PORT} da ishlamoqda`);
});
