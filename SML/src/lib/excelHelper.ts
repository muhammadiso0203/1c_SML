import * as XLSX from 'xlsx';

export interface ParsedExcelResult {
  fileName: string;
  sheetName: string;
  rowCount: number;
  columns: string[];
  rows: Record<string, unknown>[];
  previewText: string;
}

/**
 * HTML Table elementini to'g'ridan-to'g'ri .xlsx Excel faylga aylantirib yuklab berish
 */
export function exportHtmlTableToExcel(tableElement: HTMLElement, fileName = 'SML_1C_Report.xlsx'): void {
  try {
    const wb = XLSX.utils.table_to_book(tableElement, { sheet: '1C_Malumotlar' });
    XLSX.writeFile(wb, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  } catch (err) {
    console.error('Excel eksportida xatolik:', err);
  }
}

/**
 * JSON yozuvlar massivini .xlsx fayl qilib yuklab berish
 */
export function exportJsonToExcel(
  data: Record<string, unknown>[],
  fileName = 'SML_1C_Data.xlsx',
  sheetName = 'Hisobot'
): void {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  } catch (err) {
    console.error('Excel eksportida xatolik:', err);
  }
}

/**
 * Foydalanuvchi yuklagan .xlsx, .xls yoki .csv faylni o'qib, AI uchun matn va JSON ga aylantirish
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelResult> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0] || 'Sheet1';
  const ws = wb.Sheets[sheetName];

  // Qatorlarni JSON massivi sifatida olish
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
  
  // CSV formatida matn olish (AI o'qishi uchun eng qulay format)
  const rawCsv = XLSX.utils.sheet_to_csv(ws);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  // Birinchi 15 ta qatorni CSV matnida ixcham ko'rsatish
  const previewText = `Fayl: "${file.name}" (${rows.length} ta yozuv):\n` +
    `Ustunlar: ${columns.join(', ')}\n` +
    `Ma'lumotlar:\n\`\`\`csv\n${rawCsv.slice(0, 4000)}\n\`\`\``;

  return {
    fileName: file.name,
    sheetName,
    rowCount: rows.length,
    columns,
    rows,
    previewText,
  };
}
