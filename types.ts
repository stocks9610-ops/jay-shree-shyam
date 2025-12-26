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
  copiers?: string;
  totalProfit?: number;
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

export interface Strategy {
  id?: string;
  order: number;
  name: string;
  tag: string;
  hook: string;
  duration: string;
  durationMs: number;
  minRet: number;
  maxRet: number;
  risk: string;
  minInvest: number;
  vip: boolean;
  isActive: boolean;
}