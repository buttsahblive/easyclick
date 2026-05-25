import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Sparkles, CreditCard, Banknote, BookOpen, Shield, 
  UserPlus, LogIn, LogOut, ArrowRight, CheckCircle2, 
  TrendingUp, Activity, Smartphone, Check, Clock, AlertCircle, Bookmark, Copy, X
} from 'lucide-react';

import { FakeNotifications } from './components/FakeNotifications';
import { AIChatWidget } from './components/AIChatWidget';
import { DailyAdsDashboard } from './components/DailyAdsDashboard';
import { AdminPanelLayout } from './components/AdminPanelLayout';
import { User, Deposit, Withdrawal, BlogPost, InvestmentPlan } from './types';

export default function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('easy_click_token'));
  const [user, setUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [welcomeBonusClaimed, setWelcomeBonusClaimed] = useState(false);
  
  // Custom secret and auth modal states
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(!localStorage.getItem('easy_click_token'));

  // Layout navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'deposits' | 'withdrawals' | 'blogs' | 'admin'>('home');
  
  // Data lists
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // LIVE Fake Metrics (auto ticking upwards to build fake social proof)
  const [fakeStats, setFakeStats] = useState({
    activeUsers: 34182,
    totalUsers: 92849,
    monthlyWithdrawals: 4892410,
    totalDeposits: 12849200
  });

  // Forms
  const [depositForm, setDepositForm] = useState({ 
    amount: '', 
    paymentMethod: 'EasyPaisa' as 'EasyPaisa' | 'JazzCash', 
    transactionId: '',
    receiverAccount: 'Sana Sarwar (EasyPaisa - 03178849928)'
  });
  const [depositProofPhoto, setDepositProofPhoto] = useState<string>('');
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', paymentMethod: 'EasyPaisa' as 'EasyPaisa' | 'JazzCash', accountNo: '' });
  const [depositMsg, setDepositMsg] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [formErr, setFormErr] = useState('');

  // Plan purchase specific direct EasyPaisa deposit flow states
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<InvestmentPlan | null>(null);
  const [purchaseTxId, setPurchaseTxId] = useState('');
  const [purchaseProofPhoto, setPurchaseProofPhoto] = useState<string>('');
  const [purchaseError, setPurchaseError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Hydrate user profile if token exists
  const fetchProfile = async (customToken = token) => {
    if (!customToken) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${customToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expired or server restarted
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlansAndBlogs = async () => {
    try {
      const [plansRes, blogsRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/blogs')
      ]);
      if (plansRes.ok) setPlans(await plansRes.json());
      if (blogsRes.ok) setBlogs(await blogsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserTransactions = async () => {
    if (!token) return;
    try {
      const [depRes, wthRes] = await Promise.all([
        fetch('/api/deposits', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/withdrawals', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (depRes.ok) setDeposits(await depRes.json());
      if (wthRes.ok) setWithdrawals(await wthRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  // On boot load content
  useEffect(() => {
    fetchPlansAndBlogs();
    if (token) {
      fetchProfile();
      fetchUserTransactions();
    }

    // Dynamic Increment Multiplier for Live Statistics Counter (Fake Traffic simulator)
    const statsInterval = setInterval(() => {
      setFakeStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) + 1,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 2) + 1,
        monthlyWithdrawals: prev.monthlyWithdrawals + Math.floor(Math.random() * 215) + 30,
        totalDeposits: prev.totalDeposits + Math.floor(Math.random() * 380) + 50
      }));
    }, 6000);

    return () => clearInterval(statsInterval);
  }, [token]);

  // URL Hash Monitor for Secure Hidden Routing access
  useEffect(() => {
    const handleHashCheck = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#admin' || h === '#admin2121') {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) {
      setAuthError('Please fill out all identity credentials.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);

    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setAuthError(data.error || 'Authentication challenge rejected.');
      } else {
        localStorage.setItem('easy_click_token', data.token);
        setToken(data.token);
        setUsernameInput('');
        setPasswordInput('');
        if (isRegisterMode) {
          setWelcomeBonusClaimed(true);
        }
        setShowAuthModal(false);
        await fetchProfile(data.token);
      }
    } catch (err) {
      setAuthError('Platform connection timeout. Verification offline.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('easy_click_token');
    setToken(null);
    setUser(null);
    setDeposits([]);
    setWithdrawals([]);
    setActiveTab('home');
  };

  const handleBuyPlan = async (planId: string) => {
    if (!token) {
      alert('Please Login/Register first to upgrade your investment plan!');
      return;
    }
    const foundPlan = plans.find((p) => p.id === planId);
    if (!foundPlan) {
      alert('Plan configuration details not found.');
      return;
    }
    setSelectedPlanForPurchase(foundPlan);
    setPurchaseTxId('');
    setPurchaseProofPhoto('');
    setPurchaseError('');
  };

  const handlePurchaseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPurchaseProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectPlanPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError('');
    if (!purchaseTxId.trim() || purchaseTxId.trim().length < 6) {
      setPurchaseError('Please enter a valid Transaction ID (TxID) of at least 6 characters.');
      return;
    }
    if (!purchaseProofPhoto) {
      setPurchaseError('Please upload a payment proof photo or generate a mock screenshot proof.');
      return;
    }
    if (!selectedPlanForPurchase) return;

    setPurchasing(true);
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: selectedPlanForPurchase.price,
          paymentMethod: 'EasyPaisa',
          transactionId: purchaseTxId,
          proofPhoto: purchaseProofPhoto,
          planId: selectedPlanForPurchase.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(data.error || 'Direct plan purchase deposit submission failed');
      } else {
        alert(`Request submitted! Please wait while the Admin verifies your EasyPaisa transfer details. Plan ${selectedPlanForPurchase.name} will be activated instantly on verification approval.`);
        setSelectedPlanForPurchase(null);
        fetchUserTransactions();
      }
    } catch (err) {
      setPurchaseError('Failed to dispatch payment invoice. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleAutoGenerateReceipt = () => {
    if (!selectedPlanForPurchase) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f4fbf7';
      ctx.fillRect(0, 0, 400, 600);
      ctx.fillStyle = '#00a86b';
      ctx.fillRect(0, 0, 400, 100);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('easypaisa', 140, 55);
      
      ctx.beginPath();
      ctx.arc(200, 160, 35, 0, 2 * Math.PI);
      ctx.fillStyle = '#00a86b';
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('✓', 188, 172);
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Payment Sent Successfully', 95, 230);
      
      ctx.fillStyle = '#555555';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Sender Account: @${user?.username || 'Guest'}`, 50, 275);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Beneficiary Account Name: Sana Sarwar', 50, 310);
      ctx.fillStyle = '#555555';
      ctx.font = '13px sans-serif';
      ctx.fillText('EasyPaisa Number: 03178849928', 50, 330);
      
      ctx.fillStyle = '#00a86b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`PKR ${selectedPlanForPurchase.price}.00`, 110, 395);
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px monospace';
      const txid = purchaseTxId || 'EP' + Math.floor(100000 + Math.random() * 900000);
      ctx.fillText(`Transaction ID (TxID): ${txid}`, 50, 445);
      
      ctx.fillStyle = '#777777';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Timestamp: ${new Date().toLocaleString()}`, 50, 475);
      
      ctx.fillStyle = '#999999';
      ctx.font = 'italic 11px sans-serif';
      ctx.fillText('Easy Click View Monetization Verification System', 70, 540);
      
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 120, 360, 450);
      
      setPurchaseProofPhoto(canvas.toDataURL('image/png'));
    }
  };
  
  const handleGeneralDepositFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoGenerateGeneralDepositReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f4fbf7';
      ctx.fillRect(0, 0, 400, 600);
      ctx.fillStyle = '#00a86b';
      ctx.fillRect(0, 0, 400, 100);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(depositForm.paymentMethod === 'JazzCash' ? 'jazzcash' : 'easypaisa', 140, 55);
      
      ctx.beginPath();
      ctx.arc(200, 160, 35, 0, 2 * Math.PI);
      ctx.fillStyle = '#00a86b';
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('✓', 188, 172);
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Payment Sent Successfully', 95, 230);
      
      ctx.fillStyle = '#555555';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Sender Account: @${user?.username || 'Guest'}`, 50, 275);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px sans-serif';
      if (depositForm.paymentMethod === 'JazzCash') {
        ctx.fillText('Beneficiary Account Name: Tuba', 50, 310);
        ctx.fillStyle = '#555555';
        ctx.font = '13px sans-serif';
        ctx.fillText('JazzCash Number: 03204571463', 50, 330);
      } else {
        ctx.fillText('Beneficiary Account Name: Sana Sarwar', 50, 310);
        ctx.fillStyle = '#555555';
        ctx.font = '13px sans-serif';
        ctx.fillText('EasyPaisa Number: 03178849928', 50, 330);
      }
      
      ctx.fillStyle = '#00a86b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`PKR ${depositForm.amount || '300'}.00`, 110, 395);
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px monospace';
      const txid = depositForm.transactionId || 'EP' + Math.floor(100000 + Math.random() * 900000);
      ctx.fillText(`Transaction ID (TxID): ${txid}`, 50, 445);
      
      ctx.fillStyle = '#777777';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Timestamp: ${new Date().toLocaleString()}`, 50, 475);
      
      ctx.fillStyle = '#999999';
      ctx.font = 'italic 11px sans-serif';
      ctx.fillText('Easy Click View Monetization Verification System', 70, 540);
      
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 120, 360, 450);
      
      setDepositProofPhoto(canvas.toDataURL('image/png'));
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setDepositMsg('');
    const amt = parseFloat(depositForm.amount);

    if (isNaN(amt) || amt < 200) {
      setFormErr('Minimum deposit allowed is PKR 200.');
      return;
    }
    if (!depositForm.transactionId.trim()) {
      setFormErr('Please submit the Receipt Transaction ID (TXID).');
      return;
    }

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...depositForm,
          proofPhoto: depositProofPhoto || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFormErr(data.error || 'Deposit failed');
      } else {
        setDepositMsg(data.message);
        setDepositForm({ 
          amount: '', 
          paymentMethod: 'EasyPaisa', 
          transactionId: '', 
          receiverAccount: 'Sana Sarwar (EasyPaisa - 03178849928)' 
        });
        setDepositProofPhoto('');
        fetchUserTransactions();
      }
    } catch (err) {
      setFormErr('Database is busy processing deposits.');
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setWithdrawMsg('');
    const amt = parseFloat(withdrawForm.amount);

    if (isNaN(amt) || amt < 200) {
      setFormErr('Minimum withdrawal allowed is PKR 200.');
      return;
    }
    if (!user || user.balance < amt) {
      setFormErr(`Insufficient funds. Your balance is PKR ${user?.balance || 0}`);
      return;
    }
    if (withdrawForm.accountNo.trim().length < 10) {
      setFormErr('Please enter the exact mobile payment account phone number.');
      return;
    }

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(withdrawForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setFormErr(data.error || 'Withdrawal failed');
      } else {
        setWithdrawMsg(data.message);
        setWithdrawForm({ amount: '', paymentMethod: 'EasyPaisa', accountNo: '' });
        fetchProfile();
        fetchUserTransactions();
      }
    } catch (err) {
      setFormErr('Cache release blocked.');
    }
  };

  const selectCurrentPlanDetails = () => {
    if (!user || !user.activePlan || plans.length === 0) return null;
    return plans.find(p => p.id === user.activePlan) || null;
  };

  const currentPlan = selectCurrentPlanDetails();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-850 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Professional Header Navigation */}
      <header id="easy-click-navbar" className="bg-white/95 dark:bg-zinc-900/95 sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-805 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Platform Pitch with secret click handler for Admin access */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => {
              setActiveTab('home');
              setLogoClicks(prev => {
                const next = prev + 1;
                if (next >= 5) {
                  setActiveTab('admin');
                  alert('🔒 Admin Access Granted: Entering password-protected panel.');
                  return 0;
                }
                return next;
              });
            }}
            title="Click 5 times for Admin mode"
          >
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white shadow-md shadow-emerald-500/10 hover:rotate-6 transition-transform">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none flex items-center gap-1.5">
                Easy Click
                {activeTab === 'admin' && (
                  <span className="bg-zinc-900 text-white text-[8px] font-mono px-1 py-0.5 rounded border border-zinc-805">ADMIN</span>
                )}
              </h1>
              <span className="text-[9.5px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-extrabold block mt-0.5">
                Earn Online Platform
              </span>
            </div>
          </div>

          {/* Profile & Auth actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 leading-none block font-mono">My Wallet</span>
                  <span className="text-[13.5px] font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight block">
                    PKR {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 dark:bg-zinc-800 dark:text-red-400 p-2.5 rounded-xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
                  title="Sign Out Account"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsRegisterMode(true);
                    setShowAuthModal(true);
                  }}
                  className="bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-905 dark:text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setIsRegisterMode(false);
                    setShowAuthModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-6">

        {/* Welcome message for non-authenticated guests with welcome banner */}
        {!user && activeTab !== 'admin' && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-emerald-500/30">
            <div>
              <span className="bg-emerald-500/40 text-emerald-100 font-bold text-[9.5px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20">
                ⭐ Promo Earning Session Active
              </span>
              <h2 className="text-xl md:text-2xl font-black mt-2 leading-tight">
                Get PKR 100 Sign-Up Reward Instantly!
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                Unlock your digital journey on Pakistan's favorite viewer monetization network. Purchase plans starting at PKR 300 to cash-out profits directly.
              </p>
            </div>
            <button
              onClick={() => setIsRegisterMode(true)}
              className="bg-white text-emerald-800 font-extrabold text-xs py-3 px-6 rounded-xl hover:scale-105 transition-all w-fit cursor-pointer flex items-center gap-2"
            >
              Claim PKR 100 Bonus Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* USER GATE IF REGISTER MODE OR MANUAL AUTH PROMPT */}
          {welcomeBonusClaimed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-50 border border-emerald-250 text-emerald-990 p-4 rounded-xl text-xs flex gap-3 shadow-md"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900">Congratulations!</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Registration successful. We credited your new balance with <strong>PKR 100.00</strong> sign-up bonus! You are ready to explore.
                </p>
                <button 
                  onClick={() => setWelcomeBonusClaimed(false)}
                  className="mt-2 text-[10px] font-bold underline cursor-pointer"
                >
                  Acknowledge Bonus
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 1: HOME */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Introduction Banner */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-150 dark:border-zinc-805/80 shadow-sm flex flex-col lg:flex-row items-center gap-8">
                <div id="home-pitch" className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-[10.5px] font-extrabold w-fit uppercase font-mono">
                    <Activity className="h-4 w-4 animate-pulse" />
                    Verified micro-advertising hub
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 dark:text-white leading-tight">
                    Earn Real PKR Cash Daily By Viewing Basic Sponsored Ads
                  </h2>
                  <p className="text-xs md:text-sm text-slate-550 dark:text-zinc-400 leading-relaxed">
                    Easy Click represents Pakistan's premier audience optimization agency. Discover simple, accessible micro plans. Fund your secure dashboard via simple <strong>JazzCash</strong> or <strong>EasyPaisa</strong> transactions, view interactive client ad slots, and withdraw your high-yield earnings.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-md hover:scale-105 cursor-pointer block"
                    >
                      Browse Starter Plans (PKR 300)
                    </button>
                    {!user && (
                      <button
                        onClick={() => {
                          setIsRegisterMode(true);
                          // Scroll or trigger profile focus
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                        className="bg-transparent border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-slate-700 dark:text-zinc-300 font-extrabold text-xs py-3 px-5 rounded-xl transition-all cursor-pointer"
                      >
                        Register Free Account
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Fake Statistics Counter */}
                <div id="statistics-counter" className="w-full lg:w-96 bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Live Operations Center</span>
                    <span className="flex items-center gap-1.5 text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full uppercase">
                      <span className="h-1 text-center w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                      Sync active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-805 shadow-sm">
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Active Users</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-100 block font-mono mt-0.5">
                        {fakeStats.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-805 shadow-sm">
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Total Registers</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-100 block font-mono mt-0.5">
                        {fakeStats.totalUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-805 shadow-sm">
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Deposited (PKR)</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-100 block font-mono mt-0.5">
                        {fakeStats.totalDeposits.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-805 shadow-sm">
                      <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Withdraws released</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-100 block font-mono mt-0.5">
                        {fakeStats.monthlyWithdrawals.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] text-center text-zinc-400 dark:text-zinc-500 font-mono">
                    Operations update periodically based on real platform activity logs.
                  </div>
                </div>
              </div>

              {/* Three Steps Infostructure */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-805 shadow-sm space-y-3">
                  <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-white">
                    1
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Choose Investment Plan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Review our flexible plans starting at PKR 300. Starter plan yields PKR 20 daily, while higher tier Ultimate Diamond rewards PKR 900 daily.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-805 shadow-sm space-y-3">
                  <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-white">
                    2
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Watch Daily Ads
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Click "Watch Sponsored Ad" inside your dashboard. Wait for the 5-second countdown timer. The pro-rated yield credits automatically.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-805 shadow-sm space-y-3">
                  <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-white">
                    3
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Instant Mobile Cashout
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Submit a cashout invoice directly under the "Withdraw" section via EasyPaisa or JazzCash. Transacted in simple local rupees rapidly.
                  </p>
                </div>
              </div>

              {/* Guest / User Auth Form block if they are not logged in */}
              {!user && (
                <div id="quick-auth-anchor" className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-6 md:p-8 rounded-2xl shadow-lg mt-8">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      {isRegisterMode ? 'Sign Up for PKR 100 Welcome Bonus!' : 'Access Easy Click Dashboard'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                      {isRegisterMode 
                        ? 'Submit a custom username to claim your promotional platform starting bonus instantly!'
                        : 'Enter your username and password to start clicking daily ads.'}
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Platform Username:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ahmed_99"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Secure Password:
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {authError && (
                      <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs leading-normal flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {authLoading ? 'Verifying profile...' : isRegisterMode ? 'Sign Up & Claim PKR 100' : 'Sign In Dashboard'}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(!isRegisterMode);
                          setAuthError('');
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {isRegisterMode ? 'Already have an Easy Click account? Sign In' : "Don't have an account? Register Free"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* PAGE 2: INVESTMENT PLANS & AD WATCHING */}
          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Interactive Ad Watching console if plan chosen */}
              {user && (
                <div id="interactive-ads-console">
                  <DailyAdsDashboard
                    userPlanId={user.activePlan}
                    dailyAdsLeft={user.dailyAdsLeft}
                    onAdWatched={(newBalance, newAdsLeft) => {
                      setUser(prev => prev ? { ...prev, balance: newBalance, dailyAdsLeft: newAdsLeft } : null);
                    }}
                  />
                </div>
              )}

              {/* Title Section */}
              <div className="text-center max-w-xl mx-auto py-4">
                <span className="text-[10px] bg-indigo-50 dark:bg-emerald-950/30 text-indigo-600 dark:text-emerald-400 font-extrabold uppercase px-3 py-1 rounded-full tracking-wider border border-indigo-250 dark:border-emerald-900 mb-2.5 inline-block">
                  Premium Tier Allocations
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  Find the Perfect Premium Plan To Suit You
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Earn daily profits. Simply activate a plan using your platform balance. Subtraction processed instantly. Minimum plan starts at only PKR 300!
                </p>
              </div>

              {/* Grid bento layout for investment plans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((p) => {
                  const isActive = user?.activePlan === p.id;
                  return (
                    <div 
                      key={p.id}
                      className={`bg-white dark:bg-zinc-900 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all ${
                        isActive 
                          ? 'ring-2 ring-emerald-500 border-transparent dark:ring-emerald-500' 
                          : 'border-zinc-200 dark:border-zinc-805'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute right-0 top-0 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-widest py-1 px-3.5 rounded-bl-xl font-mono">
                          Active Plan
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-widest">{p.id} tier</span>
                          <h3 className="text-base font-extrabold mt-1 text-slate-900 dark:text-white">{p.name}</h3>
                        </div>

                        <div className="py-2.5">
                          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono leading-none tracking-tight">
                            PKR {p.price}
                          </span>
                          <span className="text-[9px] block text-zinc-400 uppercase mt-1">One-time Activation Fee</span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 border-t border-b border-zinc-100 dark:border-zinc-800 py-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Daily Limit:</span>
                            <span className="font-bold text-slate-850 dark:text-zinc-200">{p.dailyAds} Paid Ads</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Daily Earn:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">PKR {p.dailyEarn}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Monthly Earn:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">PKR {p.dailyEarn * 30}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Validity Block:</span>
                            <span className="font-medium text-slate-700 dark:text-zinc-300">{p.validityDays} Days</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyPlan(p.id)}
                        disabled={isActive}
                        className={`w-full text-xs font-extrabold py-3 px-4 rounded-xl mt-6 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isActive ? 'Currently Active' : `Initialize Plan • PKR ${p.price}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PAGE 3: DEPOSITS */}
          {activeTab === 'deposits' && (
            <motion.div
              key="deposits"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Deposit Form and Instructions */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 font-mono block mb-1">
                    Receipt Verification Desk
                  </span>
                  <h2 className="text-base font-extrabold text-slate-905 dark:text-white">Fund Platform Wallet</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Choose EasyPaisa or JazzCash below. Transfer funds to our listed merchant cash numbers, then submit your receipt Amount and exact Transaction ID (TXID).
                  </p>

                  {/* Merchant cash info card */}
                  <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-xl p-4.5 border border-zinc-105 dark:border-zinc-850 my-5 space-y-3 shrink-0">
                    <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Official Easy Click Merchant Wallets</span>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                      <div className="bg-white dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-105 dark:border-zinc-800/80 flex-1 relative">
                        <span className="text-[10px] font-bold text-zinc-400 block dark:text-zinc-500">EasyPaisa Account:</span>
                        <span className="text-[11.5px] font-mono font-black text-emerald-600 block mt-0.5 select-all">03178849928</span>
                        <span className="text-[9px] text-zinc-400 block font-bold">Name: Sana Sarwar</span>
                      </div>
                      
                      <div className="bg-white dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-105 dark:border-zinc-800/80 flex-1 relative">
                        <span className="text-[10px] font-bold text-zinc-400 block dark:text-zinc-500">JazzCash Account (Alternate):</span>
                        <span className="text-[11.5px] font-mono font-black text-blue-600 block mt-0.5 select-all">03204571463</span>
                        <span className="text-[9px] text-zinc-400 block font-bold">Name: Tuba</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] text-zinc-400 leading-normal block italic">* Copy numeric account number, pay exact PKR amount, then submit receipt immediately.</span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                          Deposit Gateway:
                        </label>
                        <select
                          value={depositForm.paymentMethod}
                          onChange={(e) => {
                            const method = e.target.value as 'EasyPaisa' | 'JazzCash';
                            const account = method === 'JazzCash' 
                              ? 'Tuba (JazzCash - 03204571463)' 
                              : 'Sana Sarwar (EasyPaisa - 03178849928)';
                            setDepositForm(prev => ({ 
                              ...prev, 
                              paymentMethod: method,
                              receiverAccount: account
                            }));
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="EasyPaisa">EasyPaisa Wallet</option>
                          <option value="JazzCash">JazzCash Wallet</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                          PKR Amount (Min 200):
                        </label>
                        <input
                          type="number"
                          placeholder="Amount in PKR"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="font-mono w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-905 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Ap ne kis mobile account me payment send ki hai? (Where did you pay?):
                      </label>
                      <select
                        value={depositForm.receiverAccount}
                        onChange={(e) => setDepositForm(prev => ({ ...prev, receiverAccount: e.target.value }))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Sana Sarwar (EasyPaisa - 03178849928)">Sana Sarwar (EasyPaisa - 03178849928)</option>
                        <option value="Tuba (JazzCash - 03204571463)">Tuba (JazzCash - 03204571463)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Receipt Transaction ID (TXID):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1928491823"
                        value={depositForm.transactionId}
                        onChange={(e) => setDepositForm(prev => ({ ...prev, transactionId: e.target.value }))}
                        className="font-mono uppercase w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          Payment Proof Screenshot:
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateGeneralDepositReceipt}
                          className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider hover:underline cursor-pointer"
                        >
                          ⚡ Fast Mock Screenshot
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGeneralDepositFileChange}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200 cursor-pointer"
                        />

                        {depositProofPhoto ? (
                          <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center gap-3">
                            <img 
                              src={depositProofPhoto} 
                              alt="Receipt preview" 
                              className="h-14 w-14 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0"
                            />
                            <div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 leading-none">
                                ✓ Receipt Attached
                              </span>
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-505 block mt-1 leading-snug">
                                Screenshot uploaded successfully.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            Attach a screenshot of your payment transfer. Or click <strong className="text-emerald-500 cursor-pointer hover:underline" onClick={handleAutoGenerateGeneralDepositReceipt}>Fast Mock Screenshot</strong>!
                          </div>
                        )}
                      </div>
                    </div>

                    {formErr && (
                      <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs leading-normal flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        {formErr}
                      </div>
                    )}

                    {depositMsg && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-xs leading-normal flex items-start gap-2 border border-emerald-250/50">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                        {depositMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      Verify & Submit Invoice
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Statement history */}
              <div className="lg:col-span-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Previous Deposits Ledger</h3>
                    <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">Monitor approvals of your submitted receipts here.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-[290px]">
                    {deposits.length === 0 ? (
                      <div className="text-center py-10 text-zinc-400 font-mono text-[10.5px]">
                        Zero transaction logs recorded.
                      </div>
                    ) : (
                      deposits.map((dep) => (
                        <div key={dep.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-850/80 rounded-xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <span className="font-extrabold text-zinc-905 dark:text-white font-mono block">PKR {dep.amount}</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">TXID: {dep.transactionId} • Gateway: {dep.paymentMethod}</span>
                          </div>
                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              dep.status === 'Pending' ? 'bg-amber-100 text-amber-805 dark:bg-amber-950/40 dark:text-amber-400' :
                              dep.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                            }`}>
                              {dep.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAGE 4: WITHDRAWALS */}
          {activeTab === 'withdrawals' && (
            <motion.div
              key="withdrawals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Form */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 font-mono block mb-1">
                    Direct Cash Out releases
                  </span>
                  <h2 className="text-base font-extrabold text-slate-905 dark:text-white">Cash Out Earnings</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Withdraw funds into EasyPaisa/JazzCash phone accounts. Ensure correct numeric phone configuration to prevent transit loss. Min withdrawal PKR 200.
                  </p>

                  {user && (
                    <div className="bg-emerald-50 dark:bg-zinc-950/60 p-4.5 rounded-xl border border-emerald-100 dark:border-zinc-850/80 my-5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold leading-none">Available Yield</span>
                        <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight block mt-1 leading-none">
                          PKR {user.balance.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block leading-none">Min limit:</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-350 block mt-1 leading-none">PKR 200</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                          Cash Out Gateway:
                        </label>
                        <select
                          value={withdrawForm.paymentMethod}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, paymentMethod: e.target.value as 'EasyPaisa' | 'JazzCash' }))}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="EasyPaisa">EasyPaisa</option>
                          <option value="JazzCash">JazzCash</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                          Amount in PKR:
                        </label>
                        <input
                          type="number"
                          placeholder="Payout amount"
                          value={withdrawForm.amount}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="font-mono w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                        Phone Account Number (EasyPaisa/JazzCash):
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 03001234567"
                        value={withdrawForm.accountNo}
                        onChange={(e) => setWithdrawForm(prev => ({ ...prev, accountNo: e.target.value }))}
                        className="font-mono w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-805 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {formErr && (
                      <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs leading-normal flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        {formErr}
                      </div>
                    )}

                    {withdrawMsg && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-xs leading-normal flex items-start gap-2 border border-emerald-250/50">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-550" />
                        {withdrawMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      Authorize Cash Out Release
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Ledger list */}
              <div className="lg:col-span-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Previous Cash Out Statement</h3>
                    <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">Dispatched cash out status logs monitor.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-[290px]">
                    {withdrawals.length === 0 ? (
                      <div className="text-center py-10 text-zinc-400 font-mono text-[10.5px]">
                        Zero cash out transfers registered.
                      </div>
                    ) : (
                      withdrawals.map((wth) => (
                        <div key={wth.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-105 dark:border-zinc-850/80 rounded-xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <span className="font-extrabold text-zinc-900 dark:text-white font-mono block">PKR {wth.amount}</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">Mobile Account: {wth.accountNo} ({wth.paymentMethod})</span>
                          </div>
                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              wth.status === 'Pending' ? 'bg-amber-100 text-amber-805 dark:bg-amber-950/40 dark:text-amber-400' :
                              wth.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                            }`}>
                              {wth.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAGE 5: SIMULATED BLOGS */}
          {activeTab === 'blogs' && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Headline */}
              <div className="text-center max-w-xl mx-auto py-2">
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-2 inline-block">
                  Automated Daily Content Refreshes
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  Easy Click Online Earning & Crypto Academy
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Every day, our simulated intelligence generates and publishes 20 fresh premium articles helping you maximize your mobile passive returns!
                </p>
              </div>

              {/* Grid of 20 blogs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBlog(b)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="h-44 bg-zinc-100 overflow-hidden relative">
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-mono">
                          {b.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] text-zinc-405 block">{b.date} • {b.readTime}</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {b.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-450 leading-relaxed line-clamp-2">
                          {b.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        Read Full Article
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blog Reading Full-content Modal Dialog Overlay */}
              <AnimatePresence>
                {selectedBlog && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-55 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 15 }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative"
                    >
                      {/* Header image cover */}
                      <div className="h-56 relative bg-zinc-100">
                        <img 
                          src={selectedBlog.image} 
                          alt={selectedBlog.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-6">
                          <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-400 tracking-wider">
                            {selectedBlog.category} Academy Guide
                          </span>
                          <h3 className="text-base md:text-xl font-black text-white mt-1 leading-snug">
                            {selectedBlog.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedBlog(null)}
                          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Content text */}
                      <div className="p-6 md:p-8 space-y-4">
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                          <Bookmark className="h-4 w-4 text-emerald-500" />
                          <span>Generated on: <strong>{selectedBlog.date}</strong></span>
                          <span>•</span>
                          <span>{selectedBlog.readTime}</span>
                        </div>

                        <p className="text-xs md:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
                          {selectedBlog.content}
                        </p>

                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                          <button
                            onClick={() => setSelectedBlog(null)}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold py-2 px-5 rounded-lg hover:scale-103 transition-transform cursor-pointer"
                          >
                            Close Article
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* PAGE 6: ADMIN PANEL */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <AdminPanelLayout 
                onBalanceUpdated={() => {
                  fetchProfile();
                  fetchUserTransactions();
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-805 mt-auto text-xs py-8 text-zinc-400 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-extrabold text-zinc-700 dark:text-zinc-350 flex items-center justify-center gap-1.5 leading-none">
            <Smartphone className="h-4 w-4 text-emerald-600" />
            Easy Click Online Mobile View monetization Agency
          </p>
          <p className="text-[10px] leading-relaxed max-w-xl mx-auto text-zinc-400">
            Easy Click is an entertainment, simulated learning, and micro reward platform. Always protect your platform credentials and refer payments directly using the dashboard instructions.
          </p>
          <div className="text-[10px] text-zinc-500 pt-3">
            © 2026 Easy Click Pakistan. All rights and limits secured.
          </div>
        </div>
      </footer>

      {/* Customer AI chat bot assistance widget */}
      <AIChatWidget currentUsername={user?.username || null} />

      {/* PERSISTENT MOBILE-FRIENDLY BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-[0_-5px_25px_rgba(0,0,0,0.06)] pb-safe block">
        <div className="max-w-md mx-auto flex items-center justify-between px-2 py-1.5">
          
          {/* TAB 1: HOME */}
          <button
            onClick={() => { setActiveTab('home'); setSelectedBlog(null); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'home' 
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-103' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <Home className={`h-4.5 w-4.5 ${activeTab === 'home' ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </button>

          {/* TAB 2: PLANS */}
          <button
            onClick={() => { setActiveTab('plans'); setSelectedBlog(null); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'plans' 
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-103' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <Sparkles className={`h-4.5 w-4.5 ${activeTab === 'plans' ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Plans & Ad</span>
          </button>

          {/* TAB 3: DEPOSITS */}
          <button
            onClick={() => { setActiveTab('deposits'); setSelectedBlog(null); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'deposits' 
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-103' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <CreditCard className={`h-4.5 w-4.5 ${activeTab === 'deposits' ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span className="text-[10px] mt-1 tracking-tight font-sans">Deposit</span>
          </button>

          {/* TAB 4: CASH OUT */}
          <button
            onClick={() => { setActiveTab('withdrawals'); setSelectedBlog(null); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'withdrawals' 
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-103' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <Banknote className={`h-4.5 w-4.5 ${activeTab === 'withdrawals' ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span className="text-[10px] mt-1 tracking-tight whitespace-nowrap">Cash Out</span>
          </button>

          {/* TAB 5: BLOGS */}
          <button
            onClick={() => { setActiveTab('blogs'); setSelectedBlog(null); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeTab === 'blogs' 
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-103' 
                : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <BookOpen className={`h-4.5 w-4.5 ${activeTab === 'blogs' ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Blogs</span>
          </button>

        </div>
      </div>

      {/* BEAUTIFUL AUTHENTICATION REGISTRATION AND SIGN-IN OVERLAY SCREEN */}
      <AnimatePresence>
        {showAuthModal && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-55 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              {/* Header card with promotion badge */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/45 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mx-auto w-11 h-11 bg-white/25 rounded-full flex items-center justify-center text-white mb-2 shadow-inner">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black tracking-tight leading-none text-white">
                  Easy Click Online
                </h3>
                <p className="text-[9.5px] text-emerald-100 font-bold uppercase mt-1 tracking-wider">
                  {isRegisterMode ? '✨ PKR 100 Welcome Gift!' : '🔐 Log In Wallet Access'}
                </p>
              </div>

              {/* Dynamic Sign up or Sign In Mode Toggler */}
              <div className="flex bg-zinc-50 border-b border-zinc-150 dark:bg-zinc-950 dark:border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setAuthError(''); }}
                  className={`flex-1 py-3.5 text-center transition-colors border-b-2 ${
                    isRegisterMode 
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                      : 'border-transparent text-zinc-400 font-medium'
                  }`}
                >
                  Register Account
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setAuthError(''); }}
                  className={`flex-1 py-3.5 text-center transition-colors border-b-2 ${
                    !isRegisterMode 
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                      : 'border-transparent text-zinc-400 font-medium'
                  }`}
                >
                  Sign In Wallet
                </button>
              </div>

              {/* Full Interactive authentic Submission Form */}
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                    Username Identifier:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-405 font-bold text-[11px]">@</span>
                    <input
                      type="text"
                      placeholder="e.g. zohaib_7"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 pl-8 pr-3 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-zinc-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                    System Password:
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 px-3 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-zinc-400"
                    required
                  />
                </div>

                {authError && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs flex gap-2 leading-snug font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-550" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 mt-2"
                >
                  {authLoading ? 'Verifying profile...' : isRegisterMode ? 'Register Account & Claim Promo' : 'Access Account Wallet'}
                </button>

                <div className="text-center pt-2 text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">
                  {isRegisterMode ? (
                    <span>Creates immediate profile inside simulated DB and credits <strong>PKR 100.00</strong> to balance!</span>
                  ) : (
                    <span>Use previously registered username & secret key credentials safely.</span>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BEAUTIFUL DIRECT PLAN PURCHASE EASYPAISA MODAL OVERLAY */}
      <AnimatePresence>
        {selectedPlanForPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8 text-zinc-900 dark:text-zinc-50"
            >
              {/* Header card displaying direct payment info */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForPurchase(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/45 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0 shadow-inner">
                    <Sparkles className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-emerald-200 uppercase tracking-widest font-mono font-bold block">Direct Activation</span>
                    <h3 className="text-base font-black tracking-tight leading-none text-white mt-0.5">
                      {selectedPlanForPurchase.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Instructions and receiver account card */}
              <div className="p-6 space-y-5">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl space-y-3">
                  <div className="text-center pb-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-bold">Required Investment Fee</span>
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      PKR {selectedPlanForPurchase.price.toLocaleString()}.00
                    </span>
                  </div>

                  <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3 space-y-2 text-xs">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center leading-relaxed font-sans">
                      Please send payment exactly of <strong className="text-emerald-650 dark:text-emerald-400 font-mono">PKR {selectedPlanForPurchase.price}</strong> to our designated <strong>EasyPaisa</strong> account:
                    </p>
                    <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 rounded-md">
                        <span className="text-zinc-400 text-[10px] font-semibold font-sans">EasyPaisa Account Name</span>
                        <span className="text-zinc-900 dark:text-white font-extrabold text-[11px]">Sana Sarwar</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 rounded-md">
                        <span className="text-zinc-400 text-[10px] font-semibold font-sans">EasyPaisa Number</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs select-all">03178849928</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitting form details */}
                <form onSubmit={handleDirectPlanPurchaseSubmit} className="space-y-4">
                  <div className="text-left">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                      10-Digit Transaction ID (TxID):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1928491823"
                      value={purchaseTxId}
                      onChange={(e) => setPurchaseTxId(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 px-3 py-2.5 rounded-xl border border-zinc-255 dark:border-zinc-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-zinc-400 font-mono"
                      required
                    />
                  </div>

                  <div className="text-left">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1 flex justify-between items-center">
                      <span>Payment Proof Screenshot:</span>
                      <button
                        type="button"
                        onClick={handleAutoGenerateReceipt}
                        className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider hover:underline cursor-pointer"
                      >
                        ⚡ Fast Mock Screenshot
                      </button>
                    </label>
                    
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePurchaseFileChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 px-3 py-2 rounded-xl border border-zinc-255 dark:border-zinc-800 text-xs focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-200 cursor-pointer"
                      />

                      {purchaseProofPhoto ? (
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center gap-3">
                          <img 
                            src={purchaseProofPhoto} 
                            alt="Receipt preview" 
                            className="h-14 w-14 object-cover rounded-lg border border-zinc-205 dark:border-zinc-800 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 leading-none">
                              ✓ Receipt Attached
                            </span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-1 leading-snug">
                              Ready for verification. Click Mock Screenshot to re-generate anytime.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-405 dark:text-zinc-505 leading-normal bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                          Please choose or drop payment proof photo from your device. Or click <strong className="text-emerald-500 cursor-pointer hover:underline" onClick={handleAutoGenerateReceipt}>Fast Mock Screenshot</strong> to generate a synthetic receipt!
                        </div>
                      )}
                    </div>
                  </div>

                  {purchaseError && (
                    <div className="bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs flex gap-2 leading-snug font-medium text-left">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{purchaseError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForPurchase(null)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 font-bold py-3.5 rounded-2xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={purchasing}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      {purchasing ? 'Submitting...' : 'Submit Proof'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
