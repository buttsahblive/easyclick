import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldCheck, TrendingUp } from 'lucide-react';

interface FakeToast {
  id: string;
  message: string;
  timeAgo: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
}

const PAK_NAMES = [
  'Ahmed', 'Kiran', 'Basit', 'Zainab', 'Bilal', 'Sana', 'Hamza', 'Maryum', 'Usman', 'Alia', 
  'Zubair', 'Hina', 'Saad', 'Ayesha', 'Yasir', 'Fatima', 'Danish', 'Zoya', 'Kashif', 'Amna'
];

const METHODS = ['EasyPaisa', 'JazzCash'];
const PLANS = ['Starter Bronze', 'Premium Silver', 'Elite Gold', 'Ultimate Diamond'];

export function FakeNotifications() {
  const [activeToast, setActiveToast] = useState<FakeToast | null>(null);

  useEffect(() => {
    const triggerNotification = () => {
      const name = PAK_NAMES[Math.floor(Math.random() * PAK_NAMES.length)];
      const method = METHODS[Math.floor(Math.random() * METHODS.length)];
      
      const eventChance = Math.random();
      let message = '';
      let type: 'deposit' | 'withdrawal' | 'purchase' = 'purchase';

      if (eventChance < 0.35) {
        // Withdraw event
        const amount = Math.floor(Math.random() * 8) * 500 + 400; // 400 to 4400 PKR
        message = `User "${name}" just withdrew PKR ${amount.toLocaleString()} via ${method} instantly.`;
        type = 'withdrawal';
      } else if (eventChance < 0.70) {
        // Deposit event
        const amount = Math.floor(Math.random() * 19) * 500 + 300; // 300 to 9800 PKR
        message = `User "${name}" deposited PKR ${amount.toLocaleString()} using ${method}. Check receipt!`;
        type = 'deposit';
      } else {
        // Purchase event
        const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
        message = `User "${name}" upgraded their dashboard to the ${plan} Plan!`;
        type = 'purchase';
      }

      setActiveToast({
        id: Math.random().toString(),
        message,
        timeAgo: 'Just now',
        type
      });

      // Clear after 4.5 seconds
      setTimeout(() => {
        setActiveToast(null);
      }, 4500);
    };

    // Trigger first toast after 3s
    const initialTimeout = setTimeout(triggerNotification, 3000);

    // Dynamic interval between 7s and 14s
    const checkInterval = setInterval(() => {
      if (!activeToast) {
        triggerNotification();
      }
    }, 9000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(checkInterval);
    };
  }, [activeToast]);

  return (
    <div className="fixed bottom-22 left-4 z-50 pointer-events-none max-w-sm w-full md:max-w-md">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            id="fake-stats-toast"
            className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-805/70 p-4 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md"
          >
            <div className={`p-2 rounded-lg ${
              activeToast.type === 'deposit' 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : activeToast.type === 'withdrawal'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
            }`}>
              {activeToast.type === 'deposit' && <ShieldCheck className="h-5 w-5" />}
              {activeToast.type === 'withdrawal' && <TrendingUp className="h-5 w-5" />}
              {activeToast.type === 'purchase' && <Bell className="h-5 w-5 animate-bounce" />}
            </div>
            
            <div className="flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                {activeToast.type === 'deposit' && '⚡ Realtime Deposit'}
                {activeToast.type === 'withdrawal' && '💰 Fast Withdrawal'}
                {activeToast.type === 'purchase' && '🚀 Premium Upgrade'}
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-200 mt-0.5 font-medium leading-relaxed">
                {activeToast.message}
              </p>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                {activeToast.timeAgo} • Easy Click Live Earn
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
