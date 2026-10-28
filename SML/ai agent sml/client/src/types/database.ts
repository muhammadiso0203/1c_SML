export interface TmcRecord {
  GruppaTMC: string;
  quantity: number | string;
  amount: number | string;
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
