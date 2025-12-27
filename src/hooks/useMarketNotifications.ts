import { useState, useEffect } from 'react';

export const useMarketNotifications = () => {
    const [notification, setNotification] = useState<{ title: string; message: string; type: 'opportunity' | 'warning' } | null>(null);

    useEffect(() => {
        // Random notification generator
        const messages = [
            { title: 'GOLD BREAKOUT DETECTED', message: 'XAU/USD just broke resistance at 2045. High probability setup.', type: 'opportunity' },
            { title: 'INSTITUTIONAL BUY WALL', message: 'Whale volume detected in BTC. $50M inflow in last 5m.', type: 'opportunity' },
            { title: 'VOLATILITY WARNING', message: 'Market volatility increasing. Secure your positions.', type: 'warning' },
            { title: 'EUR/USD SHORT SIGNAL', message: 'ECB Announcement causing rapid movement.', type: 'opportunity' }
        ] as const;

        const interval = setInterval(() => {
            // 30% chance to show notification every check
            if (Math.random() > 0.7) {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                setNotification(msg);

                // Auto hide after 6 seconds
                setTimeout(() => setNotification(null), 6000);
            }
        }, 45000); // Check every 45s

        return () => clearInterval(interval);
    }, []);

    return notification;
};
