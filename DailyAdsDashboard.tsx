import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, AlertCircle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface DailyAdsDashboardProps {
  userPlanId: string | null;
  dailyAdsLeft: number;
  onAdWatched: (newBalance: number, newAdsLeft: number) => void;
}

export function DailyAdsDashboard({ userPlanId, dailyAdsLeft, onAdWatched }: DailyAdsDashboardProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [counter, setCounter] = useState(5); // 5 seconds ad view duration for amazing UX
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeAd, setActiveAd] = useState<{ title: string; link: string } | null>(null);

  const DUMMY_SPONSOR_ADS = [
    { title: 'Learn Modern Affiliate Marketing with Zero Investment', link: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80' },
    { title: 'The Ultimate JazzCash Digital Wallet Hacks 2026', link: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
    { title: 'EasyPaisa Instant Micro Finance & Safety Checkmarks', link: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80' },
    { title: 'Crypto Yield Pakistan: Complete Mobile Setup Guidelines', link: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80' },
    { title: 'Earning with Zero Code: Micro task visual layout tutorial', link: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80' },
  ];

  const triggerAdWatch = () => {
    if (dailyAdsLeft <= 0) return;
    
    // Choose random ad
    const ad = DUMMY_SPONSOR_ADS[Math.floor(Math.random() * DUMMY_SPONSOR_ADS.length)];
    setActiveAd(ad);
    setIsWatching(true);
    setCounter(5);
    setSuccessMsg(null);

    const timer = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          claimProfit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimProfit = async () => {
    try {
      const token = localStorage.getItem('easy_click_token');
      if (!token) return;

      const res = await fetch('/api/ads/click', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Click reward failed');
      }

      const data = await res.json();
      setSuccessMsg(data.message || 'Ad viewed successfully!');
      onAdWatched(data.balance, data.dailyAdsLeft);
    } catch (err: any) {
      alert(err.message || 'Error claiming profit');
      setIsWatching(false);
      setActiveAd(null);
    }
  };

  const closeOverlay = () => {
    setIsWatching(false);
    setActiveAd(null);
    setSuccessMsg(null);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Daily Earnings Dashboard
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Watch interactive client advertisements to claim your pro-rated plan earnings instantly.
          </p>
        </div>
        <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Remaining Limits</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">{dailyAdsLeft} ADs Left</span>
          </div>
        </div>
      </div>

      {!userPlanId ? (
        <div className="py-8 flex flex-col items-center text-center max-w-sm mx-auto">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
          <h4 className="text-sm font-semibold">No active investment plan found</h4>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Please buy an Investment Plan below (Bronze Plan starts at only PKR 300) to receive daily advertising allocations and trigger rewards.
          </p>
        </div>
      ) : dailyAdsLeft <= 0 ? (
        <div className="py-8 flex flex-col items-center text-center max-w-sm mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
          <h4 className="text-sm font-semibold">Today's limit accomplished!</h4>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Excellent! You have exhausted all allocations for today. Come back tomorrow for full refreshes or buy another plan to expand limits.
          </p>
        </div>
      ) : (
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-full uppercase block w-fit mb-1.5">
              Plan Active • High Yield
            </span>
            <span className="font-semibold block text-zinc-200">Earn per Click: Up to PKR 50.00</span>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Each ad operates for 5 seconds. Maintain browser focus to credit your digital balance.
            </p>
          </div>
          <button
            onClick={triggerAdWatch}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="h-4 w-4 fill-white" />
            Watch Sponsored Ad Now
          </button>
        </div>
      )}

      {/* Ad Watching Fullscreen / Modal Dialog */}
      <AnimatePresence>
        {isWatching && activeAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="ad-watch-overlay"
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-center flex flex-col items-center justify-center"
            >
              {!successMsg ? (
                <>
                  <div className="relative h-14 w-14 mb-4 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-4 border-zinc-800 animate-pulse"></span>
                    <span className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></span>
                    <Clock className="h-6 w-6 text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest font-mono">
                    Verifying Ad Stream...
                  </span>
                  
                  <h4 className="text-base font-extrabold text-white mt-1 mb-3.5 px-4">
                    "{activeAd.title}"
                  </h4>

                  <div className="w-full max-w-sm h-32 rounded-lg bg-zinc-950/80 border border-zinc-850/80 flex items-center justify-center mb-5 overflow-hidden relative">
                    <img 
                      src={activeAd.link} 
                      alt="Sponsor Ad Thumbnail" 
                      className="object-cover w-full h-full opacity-40 blur-[1px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/90 flex flex-col justify-end p-3">
                      <span className="text-[10px] text-zinc-400 font-mono text-left uppercase">Interactive Client AD Slot</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 px-5 py-3.5 rounded-xl border border-zinc-805/60 w-full max-w-sm flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Please wait:</span>
                    <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">{counter}s remaining</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Do not refresh or close current screen slot during ad progression.</span>
                </>
              ) : (
                <div className="py-3 flex flex-col items-center justify-center">
                  <div className="h-12 w-12 bg-emerald-950/60 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mb-3 animate-bounce">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">Earning Claim Accomplished!</h4>
                  <p className="text-xs text-emerald-400 mt-1 font-mono font-bold leading-relaxed max-w-xs block px-3">
                    {successMsg}
                  </p>
                  
                  <button
                    onClick={closeOverlay}
                    className="mt-6 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/60 text-white font-semibold text-xs py-2 px-5 rounded-lg transition-colors cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
