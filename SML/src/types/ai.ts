export interface TmcRecord {
  GruppaTMC: string;
  quantity: number | string;
  amount: number | string;
  [key: string]: unknown;
}

export interface DbDataResponse {
  success: boolean;
  totalRecords: number;
  records: TmcRecord[];
  raw?: unknown;
}

export interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  report?: string;
  error?: string;
}

export interface TelegramStatus {
  success: boolean;
  isConfigured: boolean;
  chatId: string | null;
  hasToken: boolean;
}

export interface TelegramAlertResponse {
  success: boolean;
  message?: string;
  error?: string;
  lowStockCount?: number;
  reportText?: string;
}

