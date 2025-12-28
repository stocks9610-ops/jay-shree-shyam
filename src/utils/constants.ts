export const NETWORKS = [
    { id: 'TRX', name: 'TRON (TRC20)', chain: 'TRON', native: 'TRX', deposit: 'USDT', withdraw: 'USDT', fee: 0.1, min: 100, max: 10000, address: 'TR7NHqkoA6EwSpXAzb6sMndB5W90e7226' },
    { id: 'ETH', name: 'Ethereum (ERC20)', chain: 'ETH', native: 'ETH', deposit: 'USDT', withdraw: 'USDT', fee: 0.2, min: 100, max: 10000, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: 'BNB', name: 'Binance Smart Chain (BEP20)', chain: 'BSC', native: 'BNB', deposit: 'USDT', withdraw: 'USDT', fee: 0.1, min: 100, max: 10000, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: 'BTC', name: 'Bitcoin Network', chain: 'BTC', native: 'BTC', deposit: 'BTC', withdraw: 'BTC', fee: 0.0001, min: 0.001, max: 1, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }
];

export const WITHDRAWALS_COLLECTION = 'withdrawals';
export const TRADERS_COLLECTION = 'traders';
export const STRATEGIES_COLLECTION = 'strategies';
export const USERS_COLLECTION = 'users';
export const SEGMENTS_COLLECTION = 'segments';
export const PAYMENT_METHODS_COLLECTION = 'payment_methods';
export const DEPOSITS_COLLECTION = 'deposits';
export const SETTINGS_COLLECTION = 'settings';
