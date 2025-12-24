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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}