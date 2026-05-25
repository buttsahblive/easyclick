import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, LayoutDashboard, ArrowDownCircle, ArrowUpCircle, MessageSquareText, 
  Users, DollarSign, Loader2, Check, X, ShieldAlert, BadgeInfo 
} from 'lucide-react';
import { Deposit, Withdrawal, ChatSession } from '../types';

interface AdminPanelLayoutProps {
  onBalanceUpdated: () => void;
}

export function AdminPanelLayout({ onBalanceUpdated }: AdminPanelLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [activeTab, setActiveTab] = useState<'summary' | 'deposits' | 'withdrawals' | 'chats'>('summary');
  const [loading, setLoading] = useState(false);
  
  // Admin stats
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalDepositedApproved: 0,
    totalWithdrawnApproved: 0,
    pendingDepositsCount: 0,
    pendingWithdrawalsCount: 0,
  });
  
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [selectedProofPhoto, setSelectedProofPhoto] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2121') {
      setIsAdmin(true);
      setErrorMsg('');
      localStorage.setItem('easy_click_admin_pass', '2121');
    } else {
      setErrorMsg('Invalid password. Access is restricted to site Admins.');
    }
  };

  useEffect(() => {
    const cachedPass = localStorage.getItem('easy_click_admin_pass');
    if (cachedPass === '2121') {
      setIsAdmin(true);
    }
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/summary', {
        headers: { 'x-admin-password': '2121' }
      });
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/deposits', {
        headers: { 'x-admin-password': '2121' }
      });
      const data = await res.json();
      setDeposits(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals', {
        headers: { 'x-admin-password': '2121' }
      });
      const data = await res.json();
      setWithdrawals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/chats', {
        headers: { 'x-admin-password': '2121' }
      });
      const data = await res.json();
      setChats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger loads depends on active tab
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'summary') fetchSummary();
    if (activeTab === 'deposits') fetchDeposits();
    if (activeTab === 'withdrawals') fetchWithdrawals();
    if (activeTab === 'chats') fetchChats();
  }, [isAdmin, activeTab]);

  const handleApproveDeposit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}/approve`, {
        method: 'POST',
        headers: { 'x-admin-password': '2121' }
      });
      if (res.ok) {
        alert('Deposit approved! User profile credited instantly.');
        fetchDeposits();
        onBalanceUpdated();
      }
    } catch (e) {
      alert('Approval processing error');
    }
  };

  const handleRejectDeposit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}/reject`, {
        method: 'POST',
        headers: { 'x-admin-password': '2121' }
      });
      if (res.ok) {
        alert('Deposit rejected.');
        fetchDeposits();
      }
    } catch (e) {
      alert('Rejection error');
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: { 'x-admin-password': '2121' }
      });
      if (res.ok) {
        alert('Withdrawal marked as Approved!');
        fetchWithdrawals();
        onBalanceUpdated();
      }
    } catch (e) {
      alert('Approval error');
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { 'x-admin-password': '2121' }
      });
      if (res.ok) {
        alert('Withdrawal rejected. Funds returned to user platform balance.');
        fetchWithdrawals();
        onBalanceUpdated();
      }
    } catch (e) {
      alert('Rejection error');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setPassword('');
    localStorage.removeItem('easy_click_admin_pass');
  };

  // Login Gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Authorized Portal Only</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Please enter your administrator PIN code to access deposit logs, withdrawal releases, and AI Chat support records.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1.5">
              Secret Admin Key:
            </label>
            <input
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center text-lg font-bold uppercase tracking-widest focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs leading-relaxed flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-[10px] leading-relaxed flex gap-2">
            <BadgeInfo className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Developer Tip: The default admin password requested in instructions is <strong className="font-mono">2121</strong>.</span>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-805 rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
      {/* Top Banner */}
      <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
            SECURE ACCESS MODULE
          </span>
          <h2 className="text-base font-extrabold flex items-center gap-2 mt-0.5">
            Admin Management Desk
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Exit Panel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto bg-zinc-50 dark:bg-zinc-950/40">
        <button
          onClick={() => { setActiveTab('summary'); setSelectedChat(null); }}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'summary' 
              ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard Metrics
        </button>
        <button
          onClick={() => { setActiveTab('deposits'); setSelectedChat(null); }}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 relative cursor-pointer ${
            activeTab === 'deposits' 
              ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ArrowDownCircle className="h-4 w-4" />
          Deposit Verification
          {summary.pendingDepositsCount > 0 && (
            <span className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full block text-center shrink-0">
              {summary.pendingDepositsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('withdrawals'); setSelectedChat(null); }}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 relative cursor-pointer ${
            activeTab === 'withdrawals' 
              ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ArrowUpCircle className="h-4 w-4" />
          Withdrawal Releases
          {summary.pendingWithdrawalsCount > 0 && (
            <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full block shrink-0">
              {summary.pendingWithdrawalsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('chats'); setSelectedChat(null); }}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'chats' 
              ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <MessageSquareText className="h-4 w-4" />
          AI Chat History
        </button>
      </div>

      {/* Main Body Grid */}
      <div className="p-6">
        {loading && (
          <div className="flex justify-center items-center py-12 gap-2 text-zinc-400 font-mono text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            Querying fresh server database schema...
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {/* Tab 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-5 rounded-xl border border-zinc-105 dark:border-zinc-800/80">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wilder block mb-1">
                      Platform Members
                    </span>
                    <Users className="h-4 w-4 text-zinc-400 bg-zinc-200 dark:bg-zinc-800 rounded p-0.5" />
                  </div>
                  <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1">
                    {summary.totalUsers}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-2 block">
                    Verified registered active profiles.
                  </p>
                </div>

                <div className="bg-emerald-50/50 dark:bg-zinc-950/40 p-5 rounded-xl border border-emerald-100 dark:border-zinc-800/80">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wilder block mb-1">
                      Total Deposits released
                    </span>
                    <DollarSign className="h-4 w-4 text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 rounded p-0.5" />
                  </div>
                  <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none mt-1 font-mono">
                    PKR {summary.totalDepositedApproved.toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-2 block">
                    Approved digital payment invoices.
                  </p>
                </div>

                <div className="bg-blue-50/50 dark:bg-zinc-950/40 p-5 rounded-xl border border-blue-100 dark:border-zinc-800/80">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wilder block mb-1">
                      Paid Withdrawals
                    </span>
                    <DollarSign className="h-4 w-4 text-blue-600 bg-blue-100 dark:bg-blue-950/50 rounded p-0.5" />
                  </div>
                  <h4 className="text-2xl font-black text-blue-700 dark:text-blue-400 leading-none mt-1 font-mono">
                    PKR {summary.totalWithdrawnApproved.toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-2 block">
                    Dispatched user earnings payments.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: DEPOSITS */}
            {activeTab === 'deposits' && (
              <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-150 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase">
                      <th className="p-3.5">User</th>
                      <th className="p-3.5 text-center">Amount</th>
                      <th className="p-3.5 text-center">Plan Upgrade</th>
                      <th className="p-3.5 text-center font-mono">Transaction ID</th>
                      <th className="p-3.5 text-center">Proof Photo</th>
                      <th className="p-3.5 text-center">Paid To</th>
                      <th className="p-3.5 text-center">Gateway</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Action Desk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {deposits.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-zinc-400 font-mono text-[11px]">
                          Zero custom deposit invoices registered.
                        </td>
                      </tr>
                    ) : (
                      deposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                          <td className="p-3.5 font-semibold text-zinc-700 dark:text-zinc-200">{dep.username}</td>
                          <td className="p-3.5 text-center font-bold text-zinc-900 dark:text-white font-mono font-bold">PKR {dep.amount}</td>
                          <td className="p-3.5 text-center">
                            {dep.planId ? (
                              <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider block text-center max-w-[130px] mx-auto border border-emerald-500/25 shadow-sm">
                                ⭐ {dep.planId.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[10px] block text-center italic">Direct Wallet Fund</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{dep.transactionId}</td>
                          <td className="p-3.5 text-center">
                            {dep.proofPhoto ? (
                              <div className="flex justify-center">
                                <img 
                                  src={dep.proofPhoto} 
                                  alt="proof" 
                                  className="h-10 w-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-zoom-in hover:scale-105 transition-all shadow-sm"
                                  onClick={() => setSelectedProofPhoto(dep.proofPhoto || null)}
                                />
                              </div>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-650 italic text-[10px] block text-center">No Image</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            {dep.receiverAccount ? (
                              <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap">
                                {dep.receiverAccount}
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[10px] italic">Not Specified</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-650 px-2.5 py-1 rounded-full text-[10px]">
                              {dep.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-semibold">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dep.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                              dep.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                            }`}>
                              {dep.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {dep.status === 'Pending' ? (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => handleApproveDeposit(dep.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded transition-colors cursor-pointer"
                                  title="Verify & Fund User"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRejectDeposit(dep.id)}
                                  className="bg-red-500 hover:bg-red-650 text-white p-1 rounded transition-colors cursor-pointer"
                                  title="Reject & Deny"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-mono">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: WITHDRAWALS */}
            {activeTab === 'withdrawals' && (
              <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-805 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-150 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase">
                      <th className="p-3.5">User</th>
                      <th className="p-3.5 text-center">Request Amount</th>
                      <th className="p-3.5 text-center">Gateway</th>
                      <th className="p-3.5 text-center font-mono">Account Number</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-zinc-400 font-mono text-[11px]">
                          Zero pending withdrawal requests detected.
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((wth) => (
                        <tr key={wth.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                          <td className="p-3.5 font-semibold text-zinc-700 dark:text-zinc-200">{wth.username}</td>
                          <td className="p-3.5 text-center font-bold text-zinc-900 dark:text-white font-mono">PKR {wth.amount}</td>
                          <td className="p-3.5 text-center">
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-650 px-2 py-0.5 rounded-full text-[10px]">
                              {wth.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{wth.accountNo}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              wth.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                              wth.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                            }`}>
                              {wth.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-semibold">
                            {wth.status === 'Pending' ? (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => handleApproveWithdrawal(wth.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded transition-colors cursor-pointer"
                                  title="Release Cashback"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(wth.id)}
                                  className="bg-red-500 hover:bg-red-650 text-white p-1 rounded transition-colors cursor-pointer"
                                  title="Deny & Refund Account"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-mono">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: CHATS */}
            {activeTab === 'chats' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left: Chats list */}
                <div className="md:col-span-4 border border-zinc-150 dark:border-zinc-800 rounded-xl max-h-[380px] overflow-y-auto">
                  <div className="bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase block tracking-wider">
                    Visitor Support Sessions
                  </div>
                  {chats.length === 0 ? (
                    <div className="p-4 text-center text-zinc-400 font-mono text-[10.5px]">
                      No support conversations available.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {chats.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => setSelectedChat(ch)}
                          className={`w-full text-left p-3.5 transition-colors block cursor-pointer ${
                            selectedChat?.id === ch.id 
                              ? 'bg-emerald-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' 
                              : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 text-zinc-650 dark:text-zinc-300'
                          }`}
                        >
                          <span className="block text-xs font-semibold leading-tight">{ch.username}</span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-1">
                            Last message: {new Date(ch.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Selected conversations history */}
                <div className="md:col-span-8 border border-zinc-150 dark:border-zinc-800 rounded-xl h-[380px] flex flex-col overflow-hidden bg-zinc-50/20 dark:bg-zinc-950/10">
                  {selectedChat ? (
                    <>
                      <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-2.5 flex justify-between items-center text-xs">
                        <span>Inspector for: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{selectedChat.username}</strong></span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{selectedChat.messages.length} total messages</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedChat.messages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`flex max-w-[85%] ${
                              m.sender === 'user' ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'
                            }`}
                          >
                            <div className={`p-2 rounded-2xl text-xs leading-relaxed ${
                              m.sender === 'user'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-800 rounded-tl-none'
                                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-900 rounded-tr-none'
                            }`}>
                              <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70 mb-0.5">
                                {m.sender === 'user' ? `${selectedChat.username}` : 'AI Support Bot'}
                              </span>
                              {m.text}
                              <span className="text-[8px] opacity-60 block mt-1 text-right font-mono">
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                      <MessageSquareText className="h-8 w-8 text-zinc-350 dark:text-zinc-700 mb-2" />
                      <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Conversational Vault</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-xs mt-1 leading-normal">
                        Select any visitor username from the panel on the left to inspect detailed user queries and AI support transcript outputs.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProofPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-zinc-900 border border-zinc-805 rounded-3xl p-4 shadow-2xl space-y-4">
            <div className="flex justify-between items-center text-white border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">EasyPaisa Receipt Screenshot</span>
              <button 
                onClick={() => setSelectedProofPhoto(null)}
                className="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex justify-center max-h-[70vh]">
              <img 
                src={selectedProofPhoto} 
                alt="Payment proof high resolution" 
                className="max-w-full h-auto object-contain max-h-[65vh]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
