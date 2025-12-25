import { Trader } from '../types';

export interface UserProfile {
  username: string;
  email: string;
  password?: string;
  phone: string;
  joinDate: string;
  balance: number;
  hasDeposited: boolean;
  wins: number;
  losses: number;
  totalInvested: number;
  activeTraders: Trader[];
  schemaVersion: string;
  nodeId: string;
  referralCount: number;
  referralEarnings: number;
  pendingClaims: number;
}

const SESSION_KEY = 'zulu_auth_token_v7';
const USERS_DB_KEY = 'zulu_vault_ledger_v7';
export const BUILD_ID = 'v7.0-PLATINUM-LAUNCH';

const hashPassword = (pwd: string): string => {
  try {
    return btoa(encodeURIComponent(pwd)).split('').reverse().join('');
  } catch (e) {
    return "raw_" + pwd;
  }
};

const vault = {
  encode: (data: any) => {
    try {
      const str = JSON.stringify(data);
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
              return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      console.error("Vault Encode Error", e);
      return "";
    }
  },
  decode: (str: string) => {
    try {
      if (!str) return {};
      const decodedStr = decodeURIComponent(atob(str).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(decodedStr);
    } catch (e) {
      return {};
    }
  }
};

export const authService = {
  getDB: (): Record<string, UserProfile> => {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? vault.decode(data) : {};
    } catch {
      return {};
    }
  },

  getUser: (): UserProfile | null => {
    try {
      const email = localStorage.getItem(SESSION_KEY);
      if (!email) return null;
      
      const db = authService.getDB();
      const user = db[email.toLowerCase()];
      
      if (user) {
        let needsUpdate = false;
        if (!user.nodeId) {
          user.nodeId = `NODE-${Math.floor(1000 + Math.random() * 9000)}-${user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()}`;
          needsUpdate = true;
        }
        if (typeof user.balance !== 'number') { user.balance = 1000; needsUpdate = true; }
        if (typeof user.pendingClaims !== 'number') { user.pendingClaims = 0; needsUpdate = true; }
        
        if (needsUpdate) {
           authService.updateUser(user);
        }
        return user;
      }
    } catch (e) {
      authService.logout();
    }
    return null;
  },

  register: async (user: UserProfile): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    try {
      const db = authService.getDB();
      const emailKey = user.email.toLowerCase();

      if (db[emailKey]) return false;

      const hashedPassword = user.password ? hashPassword(user.password) : undefined;
      const safeUsername = user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'TRD';
      const nodeId = `NODE-${Math.floor(1000 + Math.random() * 9000)}-${safeUsername}`;

      db[emailKey] = { 
        ...user, 
        password: hashedPassword,
        schemaVersion: BUILD_ID, 
        activeTraders: [],
        nodeId,
        referralCount: 0,
        referralEarnings: 0,
        pendingClaims: 0
      };
      
      localStorage.setItem(USERS_DB_KEY, vault.encode(db));
      localStorage.setItem(SESSION_KEY, emailKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  login: async (email: string, password: string): Promise<UserProfile | null> => {
    await new Promise(r => setTimeout(r, 1000));
    const db = authService.getDB();
    const user = db[email.toLowerCase()];

    if (!user) return null;

    const inputHash = hashPassword(password);
    if (user.password === inputHash) {
      localStorage.setItem(SESSION_KEY, user.email.toLowerCase());
      return user;
    }
    return null;
  },

  updateUser: (updates: Partial<UserProfile>) => {
    const current = authService.getUser();
    if (!current) return null;

    const db = authService.getDB();
    const updatedUser = { ...current, ...updates };
    
    db[current.email.toLowerCase()] = updatedUser;
    localStorage.setItem(USERS_DB_KEY, vault.encode(db));
    
    return updatedUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};