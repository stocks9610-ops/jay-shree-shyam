export interface Trader {
  id: string;
  name: string;
  avatar: string;
  roi: number;
  drawdown: number;
  followers: number;
  weeks: number;
  strategy: string;
  // Profile Details
  type: 'Trader' | 'Analyst' | 'Educator';
  experienceYears: number;
  markets: string[];
  riskScore: number; // 1-10
  winRate: number;
  avgDuration: string;
  riskMethods: string[];
  bio: string;
  copyTradeId: string;
  youtubeLink?: string;
  category: 'crypto' | 'binary' | 'gold' | 'forex';
  chartData?: { value: number }[];
  commission?: string;
  isTrending?: boolean;
  aum?: string;
  copiers?: string; // string in json template, number in some usage? Let's keep consistent with valid JSON use or standardize.
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  address: string;
  qrCode?: string;
  network: string;
  isActive: boolean;
}

export interface TradingSegment {
  id: string;
  key: string;
  label: string;
  order: number;
  color: string;
}