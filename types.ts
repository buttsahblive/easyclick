export interface User {
  username: string;
  balance: number;
  activePlan: string | null;
  dailyAdsLeft: number;
  totalWithdrawn: number;
  totalDeposited: number;
  createdAt: string;
}

export interface Deposit {
  id: string;
  username: string;
  amount: number;
  paymentMethod: 'EasyPaisa' | 'JazzCash';
  transactionId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  proofPhoto?: string;
  planId?: string;
  receiverAccount?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  username: string;
  amount: number;
  paymentMethod: 'EasyPaisa' | 'JazzCash';
  accountNo: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  price: number;
  dailyEarn: number;
  dailyAds: number;
  validityDays: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  username: string;
  messages: ChatMessage[];
  updatedAt: string;
}
