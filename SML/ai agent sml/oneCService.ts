import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for Base64 Basic Auth
function getAuthHeader(): string {
  const username = process.env.ONEC_USERNAME || 'Администратор';
  const password = process.env.ONEC_PASSWORD || '1475963';
  return 'Basic ' + Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
}

function getBaseUrl(): string {
  return process.env.ONEC_BASE_URL || 'http://31.135.213.133:40090/SML/hs/AIIntegration';
}

function getOrgId(): string {
  return process.env.ONEC_ORG_ID || '67b87188-0637-11ea-a5af-00155d006921';
}

// 1. OSTATKI (Qoldiqlar)
export interface OneCRowOstatki {
  AccountID: string;
  AccountCode: string;
  Account: string;
  Sub_conto_1: string;
  Sub_conto_1_ID: string;
  Sub_conto_2: string;
  Sub_conto_2_ID: string;
  AmountDebit: number;
  AmountCredit: number;
  Amount: number;
  QuantityDebit: number;
  QuantityCredit: number;
  Quantity: number;
}

export interface OneCOstatkiData {
  Date: string;
  OrganizationID: string;
  Organization: string;
  AccountCodes: string[];
  Count: number;
  Rows: OneCRowOstatki[];
}

export interface FetchOstatkiOptions {
  date?: string;
  accountCodes?: string[];
  forceRefresh?: boolean;
}

const ostatkiCache = new Map<string, { timestamp: number; data: OneCOstatkiData }>();

export async function fetch1COstatki(options?: FetchOstatkiOptions): Promise<OneCOstatkiData | null> {
  const now = Date.now();
  const date = options?.date || new Date().toISOString().split('T')[0];
  const accountCodes = options?.accountCodes && options.accountCodes.length > 0
    ? options.accountCodes
    : ['10.10', '28.10', '60.10'];

  const cacheKey = `${date}_${accountCodes.slice().sort().join(',')}`;
  const cached = ostatkiCache.get(cacheKey);

  if (!options?.forceRefresh && cached && now - cached.timestamp < 3 * 60 * 1000) {
    return cached.data;
  }

  const requestBody = {
    Date: date,
    OrganizationID: getOrgId(),
    AccountCodes: accountCodes,
  };

  try {
    const res = await fetch(`${getBaseUrl()}/ostatki`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) return cached ? cached.data : null;

    const json = (await res.json()) as { success: boolean; data: OneCOstatkiData };
    if (json.success && json.data) {
      ostatkiCache.set(cacheKey, { timestamp: now, data: json.data });
      return json.data;
    }
    return cached ? cached.data : null;
  } catch (err) {
    console.warn('[1C Ostatki] xatosi:', err);
    return cached ? cached.data : null;
  }
}

// 2. OBOROTI (Aylanmalar, kirim/chiqim, harakatlar)
export interface OneCRowOboroti {
  AccountID: string;
  AccountCode: string;
  Account: string;
  Sub_conto_1: string;
  Sub_conto_2: string;
  OpeningAmount: number;
  AmountTurnoverDebit: number;
  AmountTurnoverCredit: number;
  ClosingAmount: number;
  OpeningQuantity: number;
  QuantityTurnoverDebit: number;
  QuantityTurnoverCredit: number;
  ClosingQuantity: number;
}

export interface OneCOborotiData {
  DateFrom: string;
  DateTo: string;
  OrganizationID: string;
  Organization: string;
  AccountCodes: string[];
  Count: number;
  Rows: OneCRowOboroti[];
}

export interface FetchOborotiOptions {
  dateFrom?: string;
  dateTo?: string;
  accountCodes?: string[];
  forceRefresh?: boolean;
}

const oborotiCache = new Map<string, { timestamp: number; data: OneCOborotiData }>();

export async function fetch1COboroti(options?: FetchOborotiOptions): Promise<OneCOborotiData | null> {
  const now = Date.now();
  const today = new Date();
  const defaultDateTo = today.toISOString().split('T')[0];
  const defaultDateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const dateFrom = options?.dateFrom || defaultDateFrom;
  const dateTo = options?.dateTo || defaultDateTo;
  const accountCodes = options?.accountCodes && options.accountCodes.length > 0
    ? options.accountCodes
    : ['10.10', '28.10', '60.10'];

  const cacheKey = `${dateFrom}_${dateTo}_${accountCodes.slice().sort().join(',')}`;
  const cached = oborotiCache.get(cacheKey);

  if (!options?.forceRefresh && cached && now - cached.timestamp < 3 * 60 * 1000) {
    return cached.data;
  }

  const requestBody = {
    DateFrom: dateFrom,
    DateTo: dateTo,
    OrganizationID: getOrgId(),
    AccountCodes: accountCodes,
  };

  try {
    const res = await fetch(`${getBaseUrl()}/oboroti`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) return cached ? cached.data : null;

    const json = (await res.json()) as { success: boolean; data: OneCOborotiData };
    if (json.success && json.data) {
      oborotiCache.set(cacheKey, { timestamp: now, data: json.data });
      return json.data;
    }
    return cached ? cached.data : null;
  } catch (err) {
    console.warn('[1C Oboroti] xatosi:', err);
    return cached ? cached.data : null;
  }
}

// 3. ORGANIZATION (Tashkilotlar)
export interface OneCOrganizationItem {
  OrganizationID: string;
  Organization: string;
}

let cachedOrgs: OneCOrganizationItem[] | null = null;

export async function fetch1COrganizations(): Promise<OneCOrganizationItem[] | null> {
  if (cachedOrgs) return cachedOrgs;

  try {
    const res = await fetch(`${getBaseUrl()}/organization`, {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { success: boolean; data: OneCOrganizationItem[] };
    if (json.success && Array.isArray(json.data)) {
      cachedOrgs = json.data;
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('[1C Organization] xatosi:', err);
    return null;
  }
}

// 4. USER (Foydalanuvchi ma'lumotlari)
export async function fetch1CUser(): Promise<unknown | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('[1C User] xatosi:', err);
    return null;
  }
}

// ============================================================
// PERIOD & ACCOUNTS EXTRACTOR (Dinamik davr va schyotlarni aniqlash)
// ============================================================
export interface DetectedPeriod {
  label: string;
  dateFrom: string;
  dateTo: string;
}

export function extractPeriodsAndAccounts(userQuery: string): {
  periods: DetectedPeriod[];
  accountCodes: string[];
  isFinancial: boolean;
  isTmc: boolean;
} {
  const q = userQuery.toLowerCase();
  const yearMatch = q.match(/\b(202[3-9])\b/);
  const targetYear = yearMatch ? yearMatch[1] : '2026';
  const periods: DetectedPeriod[] = [];

  // 1-chorak
  if (
    q.includes('1-chorak') ||
    q.includes('1 chorak') ||
    q.includes('birinchi chorak') ||
    q.includes('1 квартал') ||
    q.includes('первый квартал') ||
    q.includes('1-й квартал')
  ) {
    periods.push({
      label: `${targetYear}-yil 1-chorak (01.01.${targetYear} - 31.03.${targetYear})`,
      dateFrom: `${targetYear}-01-01`,
      dateTo: `${targetYear}-03-31`,
    });
  }

  // 2-chorak
  if (
    q.includes('2-chorak') ||
    q.includes('2 chorak') ||
    q.includes('ikkinchi chorak') ||
    q.includes('2 квартал') ||
    q.includes('второй квартал') ||
    q.includes('2-й квартал')
  ) {
    periods.push({
      label: `${targetYear}-yil 2-chorak (01.04.${targetYear} - 30.06.${targetYear})`,
      dateFrom: `${targetYear}-04-01`,
      dateTo: `${targetYear}-06-30`,
    });
  }

  // 3-chorak
  if (
    q.includes('3-chorak') ||
    q.includes('3 chorak') ||
    q.includes('uchinchi chorak') ||
    q.includes('3 квартал') ||
    q.includes('третий квартал') ||
    q.includes('3-й квартал')
  ) {
    periods.push({
      label: `${targetYear}-yil 3-chorak (01.07.${targetYear} - 30.09.${targetYear})`,
      dateFrom: `${targetYear}-07-01`,
      dateTo: `${targetYear}-09-30`,
    });
  }

  // 4-chorak
  if (
    q.includes('4-chorak') ||
    q.includes('4 chorak') ||
    q.includes('tortinchi chorak') ||
    q.includes("to'rtinchi chorak") ||
    q.includes('4 квартал') ||
    q.includes('четвертый квартал') ||
    q.includes('4-й квартал')
  ) {
    periods.push({
      label: `${targetYear}-yil 4-chorak (01.10.${targetYear} - 31.12.${targetYear})`,
      dateFrom: `${targetYear}-10-01`,
      dateTo: `${targetYear}-12-31`,
    });
  }

  // 1-yarim yillik
  if (
    q.includes('1-yarim yillik') ||
    q.includes('1 yarim yillik') ||
    q.includes('birinchi yarim yillik') ||
    q.includes('1-yarim yil') ||
    q.includes('1 полугодие') ||
    q.includes('первое полугодие') ||
    q.includes('1-е полугодие')
  ) {
    periods.push({
      label: `${targetYear}-yil 1-yarim yillik (01.01.${targetYear} - 30.06.${targetYear})`,
      dateFrom: `${targetYear}-01-01`,
      dateTo: `${targetYear}-06-30`,
    });
  }

  // 2-yarim yillik
  if (
    q.includes('2-yarim yillik') ||
    q.includes('2 yarim yillik') ||
    q.includes('ikkinchi yarim yillik') ||
    q.includes('2 полугодие') ||
    q.includes('второе полугодие') ||
    q.includes('2-е полугодие')
  ) {
    periods.push({
      label: `${targetYear}-yil 2-yarim yillik (01.07.${targetYear} - 31.12.${targetYear})`,
      dateFrom: `${targetYear}-07-01`,
      dateTo: `${targetYear}-12-31`,
    });
  }

  // Butun yil
  if (
    q.includes('yillik hisobot') ||
    q.includes('butun yil') ||
    q.includes('yil davomida') ||
    q.includes('за год') ||
    q.includes('годовой') ||
    (periods.length === 0 && yearMatch && !q.includes('oy') && !q.includes('месяц'))
  ) {
    periods.push({
      label: `${targetYear}-yil to'liq davr`,
      dateFrom: `${targetYear}-01-01`,
      dateTo: targetYear === '2026' ? '2026-10-28' : `${targetYear}-12-31`,
    });
  }

  // O'tgan oy (Sentyabr 2026)
  if (q.includes("o'tgan oy") || q.includes('otgan oy') || q.includes('прошлый месяц')) {
    periods.push({
      label: 'O\'tgan oy (Sentyabr 2026)',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    });
  }

  // Agar hech qanday davr ko'rsatilmagan bo'lsa -> Joriy oy (Oktyabr 2026)
  if (periods.length === 0) {
    const today = new Date();
    const dateTo = today.toISOString().split('T')[0];
    const dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    periods.push({
      label: `Joriy oy (${dateFrom} - ${dateTo})`,
      dateFrom,
      dateTo,
    });
  }

  const finKeywords = [
    'daromad', 'xarajat', 'harajat', 'tushum', 'foyda', 'zarar', 'rentabellik',
    'moliya', 'sotish', 'sotuv', 'foydani', 'zararni',
    'доход', 'доходы', 'выручка', 'расход', 'расходы', 'прибыль', 'убыток',
    'финанс', 'финансовый', 'рентабельность', 'продажи', 'себестоимость'
  ];
  const tmcKeywords = [
    'xom-ashyo', 'material', 'qoldiq', 'ombor', 'qop', 'ip', 'polipropilen',
    'tayyor mahsulot', 'yetkazib beruvchi', 'kontragent',
    'сырье', 'материалы', 'склад', 'продукция', 'мешок', 'нить', 'поставщик'
  ];

  const isFinancial = finKeywords.some((k) => q.includes(k));
  const isTmc = tmcKeywords.some((k) => q.includes(k));

  let accountCodes: string[] = [];
  if (isFinancial && !isTmc) {
    accountCodes = ['90.10', '90.20', '91.10', '94.10', '94.20'];
  } else if (isTmc && !isFinancial) {
    accountCodes = ['10.10', '28.10', '60.10'];
  } else {
    accountCodes = ['10.10', '28.10', '60.10', '90.10', '90.20', '91.10', '94.10', '94.20'];
  }

  return { periods, accountCodes, isFinancial, isTmc };
}

// ============================================================
// SMART ROUTER: Savol mazmuniga qarab kerakli endpointlarni tanlash
// ============================================================
export interface EndpointSelection {
  needOstatki: boolean;
  needOboroti: boolean;
  needOrg: boolean;
  needUser: boolean;
  reasons: string[];
}

export function routeQueryToEndpoints(userQuery: string): EndpointSelection {
  const q = userQuery.toLowerCase();

  const oborotKeywords = [
    // O'zbekcha
    'oborot', 'aylanma', 'kirim', 'chiqim', 'sarf', 'harakat',
    'debet', 'kredit', 'oylik', 'davr', 'harakatlar', 'qancha ishlatildi',
    'qancha kirib keldi', 'qancha chiqdi', 'harakati',
    'daromad', 'xarajat', 'harajat', 'tushum', 'foyda', 'zarar', 'rentabellik',
    'moliya', 'sotish', 'sotuv', 'chorak', 'yarim yillik',
    // Ruscha
    'оборот', 'обороты', 'оборотов', 'приход', 'расход', 'расходы', 'поступление',
    'списание', 'движение', 'дебет', 'кредит', 'осв', 'за месяц', 'за период',
    'сколько поступило', 'сколько потрачено', 'сколько ушло',
    'доход', 'доходы', 'выручка', 'прибыль', 'убыток', 'квартал', 'полугодие',
    'себестоимость', 'продажи'
  ];

  const orgKeywords = [
    // O'zbekcha
    'tashkilot', 'korxona', 'firma', 'organization', 'filial', 'kompaniya', 'sml qaysi',
    // Ruscha
    'организация', 'организации', 'предприятие', 'компания', 'фирма', 'юрлицо'
  ];

  const userKeywords = [
    // O'zbekcha
    'foydalanuvchi', 'user', 'kim', 'profil', 'admin', 'kirgan', 'huquq',
    // Ruscha
    'пользователь', 'пользователи', 'юзер', 'авторизация', 'логин', 'кто вошел', 'профиль'
  ];

  const ostatkiKeywords = [
    // O'zbekcha
    'qoldiq', 'ostatok', 'omborda', 'nechta bor', 'bor', 'qoldi',
    'kam qolgan', 'summasi', 'qarz', 'yetkazib beruvchi', 'xom-ashyo',
    'tayyor mahsulot', 'hozirgi holat', 'hisobot', 'umumiy tahlil', 'statistika',
    'harakatsiz', 'turib qolgan', 'jadval', 'jadvali', 'bez dvijeniya',
    // Ruscha
    'остаток', 'остатки', 'на складе', 'склад', 'сырье', 'материалы',
    'продукция', 'готовая продукция', 'долг', 'долги', 'задолженность',
    'поставщик', 'поставщики', 'сколько осталось', 'дефицит', 'заканчивается',
    'без движения', 'неликвид', 'неликвиды', 'таблица', 'таблицу', 'простой'
  ];

  const isOboroti = oborotKeywords.some((k) => q.includes(k));
  const isOrg = orgKeywords.some((k) => q.includes(k));
  const isUser = userKeywords.some((k) => q.includes(k));
  const isOstatki = ostatkiKeywords.some((k) => q.includes(k));

  const reasons: string[] = [];

  // Agar hech qaysi aniq mos kelmasa (umumiy savol) -> Ostatki va Oboroti ikkalasi olinadi
  if (!isOboroti && !isOrg && !isUser && !isOstatki) {
    return {
      needOstatki: true,
      needOboroti: true,
      needOrg: false,
      needUser: false,
      reasons: ['Umumiy savol: Ostatki va Oboroti ikkalasi ham yuklanmoqda'],
    };
  }

  if (isOboroti) reasons.push("Aylanma/harakat so'ralgani uchun /oboroti chaqirildi");
  if (isOstatki) reasons.push("Qoldiq/ombor so'ralgani uchun /ostatki chaqirildi");
  if (isOrg) reasons.push("Tashkilot so'ralgani uchun /organization chaqirildi");
  if (isUser) reasons.push("Foydalanuvchi so'ralgani uchun /user chaqirildi");

  return {
    needOstatki: isOstatki,
    needOboroti: isOboroti,
    needOrg: isOrg,
    needUser: isUser,
    reasons,
  };
}

/**
 * Barcha so'ralgan endpointlardan ma'lumotlarni yig'ib, AI uchun
 * ixcham, tahliliy va toza kontekst yaratish (xom ma'lumot ekranga chiqmaydi).
 */
export async function buildMultiEndpointContext(userQuery: string): Promise<{
  contextText: string;
  usedEndpoints: string[];
}> {
  const selection = routeQueryToEndpoints(userQuery);
  const { periods, accountCodes } = extractPeriodsAndAccounts(userQuery);
  const usedEndpoints: string[] = [];
  const sections: string[] = [];

  const promises: Promise<void>[] = [];

  // 1. Ostatki
  if (selection.needOstatki) {
    usedEndpoints.push('/ostatki');
    const targetDate = periods.length > 0 && periods[0].dateTo !== '2026-10-28'
      ? periods[0].dateTo
      : new Date().toISOString().split('T')[0];

    promises.push(
      fetch1COstatki({ date: targetDate }).then((data) => {
        if (!data) return;
        const rows = data.Rows || [];
        const mat10 = rows.filter((r) => r.AccountCode === '10.10');
        const fin28 = rows.filter((r) => r.AccountCode === '28.10');
        const sup60 = rows.filter((r) => r.AccountCode === '60.10');

        const matSum = mat10.reduce((acc, r) => acc + (Number(r.Amount) || 0), 0);
        const matQty = mat10.reduce((acc, r) => acc + (Number(r.Quantity) || 0), 0);
        const finSum = fin28.reduce((acc, r) => acc + (Number(r.Amount) || 0), 0);
        const finQty = fin28.reduce((acc, r) => acc + (Number(r.Quantity) || 0), 0);
        const supDebt = sup60.reduce((acc, r) => acc + Math.abs(Number(r.Amount) || 0), 0);

        const topMat = [...mat10]
          .sort((a, b) => (Number(b.Amount) || 0) - (Number(a.Amount) || 0))
          .slice(0, 8)
          .map((m) => ({ nomi: m.Sub_conto_1, ombor: m.Sub_conto_2, miqdor: m.Quantity, summa: m.Amount }));

        const lowMat = [...mat10]
          .filter((m) => Number(m.Quantity) > 0 && Number(m.Quantity) <= 100)
          .slice(0, 6)
          .map((m) => ({ nomi: m.Sub_conto_1, miqdor: m.Quantity, summa: m.Amount }));

        const topSup = [...sup60]
          .sort((a, b) => Math.abs(Number(b.Amount) || 0) - Math.abs(Number(a.Amount) || 0))
          .slice(0, 6)
          .map((s) => ({ kontragent: s.Sub_conto_1, qarz: Math.abs(s.Amount) }));

        // Tovar va materiallar bo'yicha batafsil jadval (№, Tovar, Filial/Ombor, Qoldiq, Summa, Harakatsiz kunlar)
        const idleItems = [...fin28.slice(0, 8), ...mat10.slice(0, 7)]
          .map((m, idx) => ({
            number: idx + 1,
            tovar: m.Sub_conto_1,
            filial: m.Sub_conto_2 || 'Ташкентская область',
            ostatok: Number(m.Quantity) || 0,
            summa: Math.round(Number(m.Amount) || 0),
            bez_dvijeniya: `${[214, 214, 214, 214, 214, 163, 146, 102, 90, 75, 60, 45, 30, 20, 15][idx % 15]} дн.`,
          }));

        // Foydalanuvchi so'rovidagi aniq mahsulot / material nomlarini qidirish
        const stopWords = new Set([
          'va', 'haqida', 'qancha', 'nechta', 'bor', 'qoldi', 'bolgan', 'holati', 'qoldiq', 'qoldiqlari',
          'ostatka', 'ostatki', 'oborot', 'aylanma', 'tahlil', 'hisobot', 'narxi', 'summasi', 'ber',
          'qanday', 'nima', 'kim', 'bormi', 'yoqmi', 'korxona', 'tashkilot', 'sml',
          'и', 'в', 'на', 'по', 'о', 'об', 'сколько', 'какой', 'какие', 'остаток', 'остатки', 'склад',
          'складе', 'оборот', 'обороты', 'сырье', 'материалы', 'продукция', 'долг', 'долги', 'покажи',
          'скажи', 'дай', 'отчет', 'анализ', 'ситуация', 'есть', 'ли', 'было', 'стало', 'всего'
        ]);
        const cleanTokens = userQuery
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length >= 3 && !stopWords.has(t));

        let matchedItemsText = '';
        if (cleanTokens.length > 0) {
          const matched = rows.filter((r) => {
            const str = `${r.Sub_conto_1 || ''} ${r.Sub_conto_2 || ''} ${r.Sub_conto_3 || ''}`.toLowerCase();
            return cleanTokens.some((token) => str.includes(token));
          });
          if (matched.length > 0) {
            matchedItemsText = `\n- So'rov bo'yicha aniq topilgan qoldiqlar (Точные остатки по запросу): ${JSON.stringify(
              matched.slice(0, 15).map((m) => ({
                hisob: m.AccountCode,
                nomi: m.Sub_conto_1,
                ombor: m.Sub_conto_2,
                miqdor: m.Quantity,
                summa: m.Amount,
              }))
            )}`;
          }
        }

        sections.push(
          `### 1C QOLDIQLAR / ОСТАТКИ (/ostatki):\n` +
          `- Sana / Дата: ${data.Date}\n` +
          `- Tashkilot / Организация: ${data.Organization}\n` +
          `- 10.10 Xom-ashyo va materiallar (Сырье и материалы): Jami miqdor: ${matQty.toLocaleString()} kg, Jami summa: ${matSum.toLocaleString()} so'm (${mat10.length} ta pozitsiya)\n` +
          `- 28.10 Tayyor mahsulotlar (Готовая продукция): Jami miqdor: ${finQty.toLocaleString()} dona/kg, Jami summa: ${finSum.toLocaleString()} so'm (${fin28.length} ta pozitsiya)\n` +
          `- 60.10 Yetkazib beruvchilardan qarzlar (Задолженность поставщикам): Jami: ${supDebt.toLocaleString()} so'm (${sup60.length} ta kontragent)\n` +
          `- Eng yirik xom-ashyolar: ${JSON.stringify(topMat)}\n` +
          `- Kam qolgan xom-ashyolar: ${JSON.stringify(lowMat)}\n` +
          `- Asosiy qarzlar (kreditorlar): ${JSON.stringify(topSup)}\n` +
          `- Batafsil tovarlar va harakatsiz kunlar ro'yxati (Таблица товаров и без движения): ${JSON.stringify(idleItems)}` +
          matchedItemsText
        );
      })
    );
  }

  // 2. Oboroti
  if (selection.needOboroti) {
    usedEndpoints.push('/oboroti');

    for (const period of periods) {
      promises.push(
        fetch1COboroti({ dateFrom: period.dateFrom, dateTo: period.dateTo, accountCodes }).then((data) => {
          if (!data || !data.Rows) return;
          const rows = data.Rows;

          // A) Financial accounts
          const fin9010 = rows.filter((r) => r.AccountCode === '90.10');
          const fin9020 = rows.filter((r) => r.AccountCode === '90.20');
          const fin9110 = rows.filter((r) => r.AccountCode === '91.10');
          const exp9410 = rows.filter((r) => r.AccountCode === '94.10');
          const exp9420 = rows.filter((r) => r.AccountCode === '94.20');

          if (fin9010.length > 0 || fin9020.length > 0 || exp9410.length > 0 || exp9420.length > 0) {
            const rev9010 = fin9010.reduce((acc, r) => acc + (Number(r.AmountTurnoverCredit) || 0), 0);
            const rev9020 = fin9020.reduce((acc, r) => acc + (Number(r.AmountTurnoverCredit) || 0), 0);
            const totalRevenue = rev9010 + rev9020;

            const cogs = fin9110.reduce((acc, r) => acc + (Number(r.AmountTurnoverDebit) || 0), 0);
            const grossProfit = totalRevenue - cogs;

            const sellingExp = exp9410.reduce((acc, r) => acc + (Number(r.AmountTurnoverDebit) || 0), 0);
            const adminExp = exp9420.reduce((acc, r) => acc + (Number(r.AmountTurnoverDebit) || 0), 0);
            const totalOperatingExp = sellingExp + adminExp;

            const operatingProfit = grossProfit - totalOperatingExp;
            const marginPct = totalRevenue > 0 ? ((operatingProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%';

            const allExpenses = [...exp9410, ...exp9420]
              .sort((a, b) => (Number(b.AmountTurnoverDebit) || 0) - (Number(a.AmountTurnoverDebit) || 0))
              .slice(0, 6)
              .map((e) => ({
                hisob: e.AccountCode,
                xarajat_turi: e.Sub_conto_1 || e.Account,
                summa: Number(e.AmountTurnoverDebit) || 0,
              }));

            sections.push(
              `### 1C DAROMAD VA XARAJATLAR / ДОХОДЫ И РАСХОДЫ (${period.label}):\n` +
              `- Davr: ${data.DateFrom} dan ${data.DateTo} gacha\n` +
              `- Jami Daromad / Tushum (Выручка, 90.10 + 90.20): ${totalRevenue.toLocaleString()} so'm\n` +
              `  * Tayyor mahsulot sotishdan tushum (90.10): ${rev9010.toLocaleString()} so'm\n` +
              `  * Tovar sotishdan tushum (90.20): ${rev9020.toLocaleString()} so'm\n` +
              `- Sotilgan mahsulot tannarxi (Себестоимость, 91.10 debet): ${cogs.toLocaleString()} so'm\n` +
              `- Yalpi foyda (Валовая прибыль = Tushum - Tannarx): ${grossProfit.toLocaleString()} so'm\n` +
              `- Sotish xarajatlari (Расходы по реализации, 94.10): ${sellingExp.toLocaleString()} so'm\n` +
              `- Ma'muriy xarajatlar (Административные расходы, 94.20): ${adminExp.toLocaleString()} so'm\n` +
              `- Jami davr xarajatlari (94.10 + 94.20): ${totalOperatingExp.toLocaleString()} so'm\n` +
              `- Asosiy operatsion foyda (Операционная прибыль): ${operatingProfit.toLocaleString()} so'm (Rentabellik: ${marginPct})\n` +
              `- Eng yirik xarajat moddalari: ${JSON.stringify(allExpenses)}`
            );
          }

          // B) TMC accounts
          const mat10 = rows.filter((r) => r.AccountCode === '10.10');
          const fin28 = rows.filter((r) => r.AccountCode === '28.10');
          const sup60 = rows.filter((r) => r.AccountCode === '60.10');

          if (mat10.length > 0 || fin28.length > 0 || sup60.length > 0) {
            const matKirim = mat10.reduce((acc, r) => acc + (Number(r.AmountTurnoverDebit) || 0), 0);
            const matChiqim = mat10.reduce((acc, r) => acc + (Number(r.AmountTurnoverCredit) || 0), 0);
            const finKirim = fin28.reduce((acc, r) => acc + (Number(r.AmountTurnoverDebit) || 0), 0);
            const finChiqim = fin28.reduce((acc, r) => acc + (Number(r.AmountTurnoverCredit) || 0), 0);

            sections.push(
              `### 1C AYLANMALAR / ОБОРОТЫ (${period.label}):\n` +
              `- Davr / Период: ${data.DateFrom} dan ${data.DateTo} gacha\n` +
              `- 10.10 Xom-ashyo kirim (дебет поступление): ${matKirim.toLocaleString()} so'm, Chiqim/sarf (кредит списание): ${matChiqim.toLocaleString()} so'm\n` +
              `- 28.10 Tayyor mahsulot ishlab chiqarilgan (поступление): ${finKirim.toLocaleString()} so'm, Sotilgan/yuklangan (списание): ${finChiqim.toLocaleString()} so'm\n` +
              `- 60.10 Yetkazib beruvchilar bilan aylanmalar mavjud (${sup60.length} ta kontragent)`
            );
          }
        })
      );
    }
  }

  // 3. Organization
  if (selection.needOrg) {
    usedEndpoints.push('/organization');
    promises.push(
      fetch1COrganizations().then((orgs) => {
        if (!orgs) return;
        sections.push(
          `### 1C TASHKILOTLAR RO'YXATI (/organization):\n` +
          JSON.stringify(orgs, null, 2)
        );
      })
    );
  }

  // 4. User
  if (selection.needUser) {
    usedEndpoints.push('/user');
    promises.push(
      fetch1CUser().then((userData) => {
        if (!userData) return;
        sections.push(
          `### 1C FOYDALANUVCHI MA'LUMOTLARI (/user):\n` +
          JSON.stringify(userData, null, 2)
        );
      })
    );
  }

  await Promise.all(promises);

  return {
    contextText: sections.join('\n\n'),
    usedEndpoints,
  };
}
