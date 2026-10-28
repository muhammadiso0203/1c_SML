import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. OpenAI mijozini sozlash
const apiKey = process.env.OPENAI_API_KEY;
const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  console.log('\n⚠️  DIQQAT: .env faylida OPENAI_API_KEY topilmadi yoki kiritilmagan.');
  console.log('Iltimos, .env faylini oching va haqiqiy OpenAI API kalitingizni kiriting:\n');
  console.log('   OPENAI_API_KEY=sk-...\n');
}

const openai = new OpenAI({ apiKey: apiKey || 'dummy_key' });

export interface DatabaseDataContext {
  source: string;
  data: unknown;
  rawText: string;
}

/**
 * data/ papkasidagi mavjud ma'lumotlar bazasi faylini o'qish (JSON yoki CSV)
 */
export function loadDatabaseData(): DatabaseDataContext | null {
  const jsonPath = path.join(__dirname, 'data', 'database.json');
  const csvPath = path.join(__dirname, 'data', 'data.csv');

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const data: unknown = JSON.parse(raw);
      return {
        source: 'database.json',
        data,
        rawText: JSON.stringify(data, null, 2),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('JSON faylni o\'qishda xatolik:', msg);
    }
  }

  if (fs.existsSync(csvPath)) {
    const raw = fs.readFileSync(csvPath, 'utf8');
    return {
      source: 'data.csv',
      data: raw,
      rawText: raw,
    };
  }

  return null;
}

/**
 * AI ga so'rov yuborish va tahlil olish
 */
export async function askAI(prompt: string, dataContext: DatabaseDataContext): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('.env faylida OPENAI_API_KEY ko\'rsatilmagan!');
  }

  const systemMessage = `Siz faqat ushbu tizim va ma'lumotlar bazasi (TMC / xom-ashyo, mahsulotlar, qoldiqlar, summalar, sarf-xarajatlar va tahlillar) bo'yicha ixtisoslashgan rasmiy AI Yordamchisiz.

QAT'IY QOIDALAR VA CHEKLOVLAR:
1. FAQAT va FAQAT quyida keltirilgan ma'lumotlar bazasi, korxona xom-ashyolari, ularning narxi, miqdori, foizlari, hisob-kitoblari va ularga oid tahlillar haqidagi savollarga javob bering.
2. Agar foydalanuvchi mavzudan tashqari boshqa narsalar (masalan: qo'shiqchilar, san'atkorlar, filmlar, rasm, ob-havo, musiqalar yoki begona mavzular) haqida so'rasa, mutlaqo javob BERMANG!
3. Mavzudan tashqari savollarga doimo quyidagicha xushmuomala rad javobini bering:
   "Kechirasiz, men faqat ushbu korxona ma'lumotlar bazasi, xom-ashyo (TMC) qoldiqlari, hisob-kitoblar va tahlillar bo'yicha yordam bera olaman. Iltimos, baza bo'yicha savolingizni bering."
4. Barcha xulosalar, hisob-kitoblar va savollarga javoblarni faqat shu ma'lumotlar bazasiga tayangan holda bering.
5. Foydalanuvchi qaysi tilda (o'zbek yoki rus tilida) savol bersa, javobni xuddi o'sha tilda (o'zbekcha yoki ruscha) bering.

MA'LUMOTLAR BAZASI (${dataContext.source}):
\`\`\`
${dataContext.rawText}
\`\`\``;

  const response = await openai.chat.completions.create({
    model: modelName,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || '';
}

import {
  findLowStockItems,
  generateStockAlertReport,
  sendTelegramMessage,
  LowStockItem,
} from './telegram.js';
import { DatabaseResult, TmcRecord } from './server.js';

/**
 * Interaktiv CLI orqali savol-javob va avtomatik tahlil qilish
 */
async function startInteractiveSession(): Promise<void> {
  console.log('=====================================================');
  console.log('🤖 AI DATABASE ANALYZER & TELEGRAM AGENT');
  console.log('=====================================================');

  const db = loadDatabaseData();
  if (!db) {
    console.log('\n❌ data/ papkasida database.json yoki data.csv topilmadi.');
    console.log('Iltimos, data/ papkasiga ma\'lumotlar faylingizni joylang.\n');
    return;
  }

  console.log(`\n📁 Yuklangan baza: [data/${db.source}]`);
  const rawData = db.data as { data?: unknown[] } | unknown[];
  const records = Array.isArray(rawData) ? rawData : (Array.isArray((rawData as { data?: unknown[] })?.data) ? (rawData as { data?: unknown[] }).data : null);
  if (records) {
    console.log(`📊 Yozuvlar soni: ${records.length} ta guruh/mahsulot`);
  }

  console.log('\nTanlang:');
  console.log('1. 📈 Bazani to\'liq avtomatik tahlil qilish (Hisobot yaratish)');
  console.log('2. 💬 AI bilan erkin savol-javob qilish (Baza bo\'yicha istalgan savol)');
  console.log('3. 📲 Kam qolgan mahsulotlarni tekshirish va Telegram guruhga yuborish');
  console.log('4. 🚪 Chiqish');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q: string): Promise<string> => new Promise((resolve) => rl.question(q, resolve));

  const choice = await question('\nTanlovingizni kiriting (1/2/3/4): ');

  if (choice === '1') {
    console.log('\n⏳ Baza sun\'iy intellekt tomonidan tahlil qilinmoqda...');
    try {
      const prompt = `Ushbu ma'lumotlar bazasini to'liq tahlil qilib bering:
1. Umumiy statistika va asosiy ko'rsatkichlar.
2. Qiziqarli trendlar va qonuniyatlar.
3. Topilgan muammolar yoki bekor qilingan/shubhali holatlar.
4. Biznes/jarayonni yaxshilash uchun aniq tavsiyalar.`;
      const result = await askAI(prompt, db);
      console.log('\n--- 📋 TAHLIL NATIJASI ---\n');
      console.log(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('\n❌ Xatolik:', msg);
    }
    rl.close();
  } else if (choice === '2') {
    console.log('\n💬 AI tayyor! Baza bo\'yicha istalgan savolingizni bering (chiqish uchun "exit" yozing):\n');
    const chatLoop = async (): Promise<void> => {
      const userPrompt = await question('👤 Savol: ');
      if (userPrompt.trim().toLowerCase() === 'exit' || userPrompt.trim().toLowerCase() === 'chiqish') {
        console.log('Xayr!');
        rl.close();
        return;
      }
      if (!userPrompt.trim()) {
        await chatLoop();
        return;
      }

      console.log('🤖 AI tahlil qilmoqda...');
      try {
        const answer = await askAI(userPrompt, db);
        console.log(`\n💡 AI Javobi:\n${answer}\n`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('\n❌ Xatolik:', msg);
      }
      await chatLoop();
    };
    await chatLoop();
  } else if (choice === '3') {
    console.log('\n🔍 Kam qolgan mahsulotlar tekshirilmoqda...');
    try {
      const parsedRecords: TmcRecord[] = Array.isArray(records) ? (records as TmcRecord[]) : [];
      const dbResult: DatabaseResult = {
        raw: db.data,
        records: parsedRecords,
        rawText: db.rawText,
      };

      const lowStockItems = findLowStockItems(dbResult);
      console.log(`⚠️ Kam qolgan tovarlar soni: ${lowStockItems.length} ta`);

      lowStockItems.forEach((item: LowStockItem, idx: number) => {
        console.log(`   ${idx + 1}. ${item.name} -> Qoldiq: ${item.quantity} (Summa: ${item.amount.toLocaleString()} so'm)`);
      });


      console.log('\n🤖 AI xulosasi va hisoboti tayyorlanmoqda...');
      const report = await generateStockAlertReport(openai, modelName, dbResult, lowStockItems);

      const sendConfirm = await question('\nUshbu hisobot Telegram guruhiga yuborilsinmi? (ha/yoq): ');
      if (sendConfirm.toLowerCase() === 'ha' || sendConfirm.toLowerCase() === 'h' || sendConfirm.toLowerCase() === 'yes' || sendConfirm.toLowerCase() === 'y') {
        console.log('📤 Telegram guruhiga yuborilmoqda...');
        const res = await sendTelegramMessage(report, 'HTML');
        if (res.success) {
          console.log('✅ ' + res.message);
        } else {
          console.log('❌ Xatolik: ' + res.error);
        }
      } else {
        console.log('Hisobot yuborilmadi.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('\n❌ Xatolik:', msg);
    }
    rl.close();
  } else {
    console.log('Dastur yakunlandi.');
    rl.close();
  }
}

// Skript to'g'ridan-to'g'ri chaqirilganda ishga tushirish
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startInteractiveSession();
}

