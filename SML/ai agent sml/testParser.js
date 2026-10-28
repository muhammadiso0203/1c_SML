import { getBaseUrl, getAuthHeader, getOrgId } from './oneCService.js';

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

  // O'tgan oy
  if (q.includes("o'tgan oy") || q.includes('otgan oy') || q.includes('прошлый месяц')) {
    periods.push({
      label: 'O\'tgan oy (Sentyabr 2026)',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    });
  }

  // Agar hech qanday davr ko'rsatilmagan bo'lsa -> Joriy oy
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

const testQuery = "birinchi yarim yillik 2026 va birinchi chorak 2026 yil uchun daromad va harajatlar tahlilini ko'rsat";
const result = extractPeriodsAndAccounts(testQuery);
console.log('Periods detected:', result.periods);
console.log('Account codes:', result.accountCodes);

