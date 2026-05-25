import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

// Initialize Gemini SDK if API Key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini API client:', err);
  }
} else {
  console.warn('GEMINI_API_KEY environment variable is not configured or has default placeholder.');
}

// Low-profile JSON-based Database Engine
const DB_FILE = path.join(process.cwd(), 'easy_click_db.json');

// Define Investment Plans matching constraints (Minimum plan at least PKR 300)
const SYSTEM_PLANS = [
  { id: 'bronze', name: 'Starter Bronze', price: 300, dailyEarn: 20, dailyAds: 5, validityDays: 30 },
  { id: 'silver', name: 'Premium Silver', price: 1000, dailyEarn: 75, dailyAds: 10, validityDays: 30 },
  { id: 'gold', name: 'Elite Gold', price: 3000, dailyEarn: 250, dailyAds: 15, validityDays: 30 },
  { id: 'diamond', name: 'Ultimate Diamond', price: 10000, dailyEarn: 900, dailyAds: 25, validityDays: 30 },
];

function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      users: {},
      deposits: [],
      withdrawals: [],
      chats: {},
      blogs: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    console.log('Database initialized successfully.');
  }
  
  // Seed blogs if empty or daily update
  const currentData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (!currentData.blogs || currentData.blogs.length === 0 || currentData.lastBlogUpdate !== todayStr) {
    currentData.blogs = generateSimulatedBlogs();
    currentData.lastBlogUpdate = todayStr;
    
    // Seed some initial demonstrative pending items for the Admin Panel
    if (Object.keys(currentData.users).length === 0) {
      // Seed an admin-demo account
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHmac('sha256', salt).update('password123').digest('hex');
      currentData.users['demo_user'] = {
        username: 'demo_user',
        salt,
        passwordHash: hash,
        balance: 500,
        activePlan: 'bronze',
        dailyAdsLeft: 5,
        totalWithdrawn: 1500,
        totalDeposited: 1800,
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
      };
      
      // Seed demo deposits
      currentData.deposits = [
        {
          id: 'DEP_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: 'demo_user',
          amount: 1000,
          paymentMethod: 'JazzCash',
          transactionId: 'TXN99882312',
          status: 'Pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'DEP_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: 'demo_user',
          amount: 800,
          paymentMethod: 'EasyPaisa',
          transactionId: 'TXN44558211',
          status: 'Approved',
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        }
      ];

      // Seed demo withdrawals
      currentData.withdrawals = [
        {
          id: 'WTH_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          username: 'demo_user',
          amount: 1500,
          paymentMethod: 'EasyPaisa',
          accountNo: '03001234567',
          status: 'Pending',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Seed a starter chat
      currentData.chats['demo_user'] = {
        id: 'demo_user',
        username: 'demo_user',
        messages: [
          { sender: 'user', text: 'Hello, how can I earn money here?', timestamp: new Date(Date.now() - 10000).toISOString() },
          { sender: 'ai', text: 'Welcome to Easy Click! You can earn by purchasing our Premium Investment plans starting at just PKR 300, and viewing interactive daily ads. Do you have any general or payment questions?', timestamp: new Date().toISOString() }
        ],
        updatedAt: new Date().toISOString()
      };
    }
    
    fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2));
  }
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading database:', err);
    return { users: {}, deposits: [], withdrawals: [], chats: {}, blogs: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// Standard Dynamic Simulator for 20 Daily Blogs
function generateSimulatedBlogs() {
  const categories = ['Earning Tips', 'Crypto', 'Affiliate Marketing', 'EasyPaisa/JazzCash Guide', 'Success Stories', 'Fintech Review'];
  const titles = [
    'How to Make PKR 2,000 Daily From Your Smartphone',
    'Understanding Easy Click Earnings: Proof & Strategy',
    'A Beginner\'s Guide to Investing in Digital Starter Plans',
    'Top 5 Side Hustles in Pakistan for Students in 2026',
    'JazzCash vs EasyPaisa: Which is Best for Digital Collections?',
    'Earning Online: Myth vs Reality Analyzed in Urdu/English',
    'How Salman earned PKR 50,000 last month via Easy Click advertising',
    'The Power of Consistency: How viewing 10 Ads per day changes your digital wallet',
    'Is Passive Income possible with just 300 PKR in Pakistan?',
    '5 Secrets of successful online earners in Lahore and Karachi',
    'A Simple tutorial on verifying your automated deposits instantly',
    'Crypto vs Visual Ads Earning: Security and Returns comparison',
    'Why Easy Click remains the fastest earning hub of the year',
    'Understanding the EasyPaisa transaction limits and how to manage withdrawals',
    'Freelancing Alternatives: Why visual micro-tasks require zero coding',
    'The evolution of click-to-earn marketing models across Asia',
    'Mastering the referral system to triple your monthly rewards',
    'Tips for secure withdrawals without high processing delays',
    'How digital ad views are transforming regional marketing structures',
    'The future of smart home earners: Insights from industry experts'
  ];
  const excerpts = [
    'Discover the exact strategy to optimize your click-to-earn daily limits smoothly.',
    'A deep dive into our Easy Click system metrics and how thousands generate real utility daily.',
    'Get started with micro-investments safely and watch your digital passive yield grow.',
    'No coding, no high-class setups needed. Just your normal smartphone and 10 spare minutes daily.',
    'An extensive comparison of regional payment gateways and cash-out systems.',
    'Unveiling the honest structures of visual reward programs and why they represent highly robust business models.',
    'Read the thrilling story of Salman, an undergraduate student who built his financial independence rapidly.',
    'We structure the mathematics behind viewing active sponsored links to yield maximum daily returns.',
    'Breaking down micro plans and answering user queries regarding digital earnings.',
    'We compiled elite tactics of local power users who earn massive profits daily.',
    'Follow these five security check marks to get automated approval for every account transfer.',
    'Why micro task viewing is safer, has zero market volatility, and protects your base funds.',
    'A highly analytical look into Easy Click\'s active user network and verified proofs.',
    'Important updates regarding EasyPaisa services, tax structures, and quick deposits.',
    'Why you should not waste funds on expensive courses when simple micro tasks pay instantly.',
    'An elaborate guide of advertising systems, user profiles, and active click rates.',
    'Learn how sharing your reference links earns you a lifetime commission with zero efforts.',
    'Never wait for approval! Optimize the timing of your EasyPaisa & JazzCash cash-outs.',
    'How regional micro-merchants leverage click programs to trigger scalable visual views.',
    'The definitive guide to smartphone cash structures, passive profit indices, and digital safety.'
  ];
  
  const blogs = [];
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  for (let i = 0; i < 20; i++) {
    blogs.push({
      id: `blog_${i + 1}`,
      title: titles[i % titles.length],
      excerpt: excerpts[i % excerpts.length],
      content: `This is the full premium article for blog post ${i + 1}. It details strategic guidelines to maximize digital returns, configure payment methods, and make the most out of online platform monetization. Easy Click represents the premier platform for thousands of active learners in Pakistan. \n\nWe provide extensive, simple tutorials designed to guide novices through initial setups. To maximize your returns on Easy Click:\n\n1. Select an investment plan that fits your target budget (remember, minimum plan starts at only PKR 300!).\n2. Complete your daily ad quotas diligently. Each ad represents a verified sponsor.\n3. Keep your deposit transaction IDs clean to avoid support bottlenecks.\n4. Take advantage of our automated 24/7 AI chat assistant on the corner of the website.\n\nFollowing these protocols ensures a high-yield experience from the comfort of your couch!`,
      category: categories[i % categories.length],
      readTime: `${3 + (i % 5)} Min Read`,
      date: dateStr,
      image: `https://images.unsplash.com/photo-${1500000000000 + i * 123456}?auto=format&fit=crop&w=800&q=80` // standard unsplash fallbacks
    });
  }
  return blogs;
}

async function startServer() {
  initDB();
  const PORT = 3000;
  const app = express();
  app.use(express.json());

  // Helper Auth function
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.replace('Bearer ', '');
    // Simple Base64 decoding or exact string check to avoid complex setup
    let username = '';
    try {
      username = Buffer.from(token, 'base64').toString('utf-8');
    } catch (e) {
      return res.status(403).json({ error: 'Invalid token structure' });
    }
    
    const db = readDB();
    if (!db.users[username]) {
      return res.status(403).json({ error: 'User session expired or invalid' });
    }
    
    (req as any).username = username;
    next();
  };

  // Helper Admin password check
  const checkAdminPassword = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword === '2121') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: Invalid admin password' });
    }
  };

  // ==================== AUTH API ====================
  app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    const db = readDB();
    if (db.users[cleanUsername]) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');

    db.users[cleanUsername] = {
      username: cleanUsername,
      salt,
      passwordHash: hash,
      balance: 100, // PKR 100 free sign up bonus to incentivize users!
      activePlan: null,
      dailyAdsLeft: 0,
      totalWithdrawn: 0,
      totalDeposited: 0,
      createdAt: new Date().toISOString()
    };

    writeDB(db);
    
    const token = Buffer.from(cleanUsername).toString('base64');
    res.json({ token, username: cleanUsername, message: 'Registration successful! Active PKR 100 welcome bonus!' });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const db = readDB();
    const user = db.users[cleanUsername];
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const hash = crypto.createHmac('sha256', user.salt).update(password).digest('hex');
    if (hash !== user.passwordHash) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = Buffer.from(cleanUsername).toString('base64');
    res.json({ token, username: cleanUsername });
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const db = readDB();
    const user = db.users[(req as any).username];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return user with password fields stripped
    const { salt, passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // ==================== SYSTEMS / PLANS API ====================
  app.get('/api/plans', (req, res) => {
    res.json(SYSTEM_PLANS);
  });

  app.post('/api/plans/purchase', authenticateToken, (req, res) => {
    const { planId } = req.body;
    const plan = SYSTEM_PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid investment plan selected' });
    }

    const db = readDB();
    const username = (req as any).username;
    const user = db.users[username];

    if (user.balance < plan.price) {
      return res.status(400).json({ error: `Insufficient balance. This plan costs PKR ${plan.price}, but your balance is PKR ${user.balance}. Please deposit of PKR ${plan.price - user.balance} or more first.` });
    }

    user.balance -= plan.price;
    user.activePlan = plan.id;
    user.dailyAdsLeft = plan.dailyAds;
    
    writeDB(db);
    res.json({ message: `Successfully purchased ${plan.name}! You have been allocated ${plan.dailyAds} ads to watch today.`, balance: user.balance, activePlan: user.activePlan });
  });

  // ==================== AD WATCHING ENGINE ====================
  app.post('/api/ads/click', authenticateToken, (req, res) => {
    const db = readDB();
    const username = (req as any).username;
    const user = db.users[username];

    if (!user.activePlan) {
      return res.status(400).json({ error: 'You do not have an active investment plan. Please buy a plan first to earn from daily ads!' });
    }

    if (user.dailyAdsLeft <= 0) {
      return res.status(400).json({ error: 'No daily ads remaining. Your plan daily limit is reached! Come back tomorrow or upgrade for more.' });
    }

    const plan = SYSTEM_PLANS.find(p => p.id === user.activePlan);
    if (!plan) {
      return res.status(400).json({ error: 'Active plan integrity exception' });
    }

    const payout = plan.dailyEarn / plan.dailyAds; // Pro-rated payout per individual ad click
    const roundedPayout = parseFloat(payout.toFixed(2));

    user.balance = parseFloat((user.balance + roundedPayout).toFixed(2));
    user.dailyAdsLeft -= 1;

    writeDB(db);
    res.json({
      message: `Congratulations! Ad viewed successfully. Account credited with PKR ${roundedPayout}.`,
      balance: user.balance,
      dailyAdsLeft: user.dailyAdsLeft
    });
  });

  // ==================== BLOG SERVICE ====================
  app.get('/api/blogs', (req, res) => {
    const db = readDB();
    res.json(db.blogs || []);
  });

  // ==================== DEPOSITS API ====================
  app.post('/api/deposits', authenticateToken, (req, res) => {
    const { amount, paymentMethod, transactionId, proofPhoto, planId, receiverAccount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }
    if (amount < 200) {
      return res.status(400).json({ error: 'Minimum deposit amount is PKR 200' });
    }
    if (!paymentMethod || (paymentMethod !== 'EasyPaisa' && paymentMethod !== 'JazzCash')) {
      return res.status(400).json({ error: 'Payment method must be either EasyPaisa or JazzCash' });
    }
    if (!transactionId || transactionId.trim().length < 6) {
      return res.status(400).json({ error: 'A valid Transaction ID from JazzCash/EasyPaisa receipt is required' });
    }

    const cleanTxId = transactionId.trim().toUpperCase();
    const db = readDB();
    
    // Check if TXID already registered
    const duplicate = db.deposits.find((d: any) => d.transactionId === cleanTxId);
    if (duplicate) {
      return res.status(400).json({ error: 'This Transaction ID is already pending or processed. Dual-submission prohibited.' });
    }

    const username = (req as any).username;
    const newDeposit = {
      id: 'DEP_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username,
      amount: parseFloat(amount),
      paymentMethod,
      transactionId: cleanTxId,
      proofPhoto: proofPhoto || null,
      planId: planId || null,
      receiverAccount: receiverAccount || null,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    db.deposits.unshift(newDeposit);
    writeDB(db);

    res.json({ message: 'Deposit request submitted successfully! Your account will be credited as soon as the Admin approves the receipt verification.', deposit: newDeposit });
  });

  app.get('/api/deposits', authenticateToken, (req, res) => {
    const db = readDB();
    const username = (req as any).username;
    const userDeposits = db.deposits.filter((d: any) => d.username === username);
    res.json(userDeposits);
  });

  // ==================== WITHDRAWALS API ====================
  app.post('/api/withdrawals', authenticateToken, (req, res) => {
    const { amount, paymentMethod, accountNo } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }
    if (amount < 200) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is PKR 200' });
    }
    if (!paymentMethod || (paymentMethod !== 'EasyPaisa' && paymentMethod !== 'JazzCash')) {
      return res.status(400).json({ error: 'Payment method must be either EasyPaisa or JazzCash' });
    }
    if (!accountNo || accountNo.trim().length < 10) {
      return res.status(400).json({ error: 'Please specify a proper 11-digit JazzCash/EasyPaisa phone account number' });
    }

    const db = readDB();
    const username = (req as any).username;
    const user = db.users[username];

    if (user.balance < amount) {
      return res.status(400).json({ error: `Insufficient funds. Your current balance is PKR ${user.balance}, but you requested PKR ${amount}.` });
    }

    user.balance = parseFloat((user.balance - amount).toFixed(2));

    const newWithdrawal = {
      id: 'WTH_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      username,
      amount: parseFloat(amount),
      paymentMethod,
      accountNo: accountNo.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    db.withdrawals.unshift(newWithdrawal);
    writeDB(db);

    res.json({ message: 'Withdrawal request registered! Pending review from administrative payments desk.', withdrawal: newWithdrawal, balance: user.balance });
  });

  app.get('/api/withdrawals', authenticateToken, (req, res) => {
    const db = readDB();
    const username = (req as any).username;
    const userWithdrawals = db.withdrawals.filter((w: any) => w.username === username);
    res.json(userWithdrawals);
  });

  // ==================== AI CHAT ASSISTANT & CHAT HISTORY ====================
  app.post('/api/chat/message', async (req, res) => {
    const { message, username } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is empty' });
    }

    const activeUser = (username || 'Anonymous_Visitor').trim();
    const db = readDB();

    if (!db.chats[activeUser]) {
      db.chats[activeUser] = {
        id: activeUser,
        username: activeUser,
        messages: [],
        updatedAt: new Date().toISOString()
      };
    }

    const session = db.chats[activeUser];
    const userTimestamp = new Date().toISOString();
    session.messages.push({
      sender: 'user',
      text: message,
      timestamp: userTimestamp
    });

    let aiRepliedText = '';

    if (aiClient) {
      try {
        // Construct standard localized instructions to force AI agent persona
        const sysPrompt = `You are "Easy Click Assistant", a dynamic customer service representative for Easy Click, the premium online earning agency. 
Tell users they can buy plans to view daily ads and make profits:
- Bronze Plan costs PKR 300, daily earnings PKR 20 (allocated 5 daily ads). This is the minimum startup plan.
- Premium Silver Plan costs PKR 1,000, daily earnings PKR 75 (10 ads).
- Elite Gold Plan costs PKR 3,000, daily earnings PKR 250 (15 ads).
- Ultimate Diamond Plan costs PKR 10,000, daily earnings PKR 900 (25 ads).
Deposits and withdrawals are safely transacted via EasyPaisa and JazzCash with a short processing window of a few hours. Minimum deposit & withdrawal is PKR 200.
Always be extremely polite, engaging, precise, and supportive. Promote our earnings model enthusiastically! Keep answers concise, direct, helpful, and easily understandable. Speak in professional Urdu mixed with simple English (Roman Urdu/English format) if asked or naturally.`;

        // Format conversational history for @google/genai
        const recentMessages = session.messages.slice(-10); // last 10 turns
        const chatContents = recentMessages.map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        const geminiRes = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: chatContents,
          config: {
            systemInstruction: sysPrompt,
            temperature: 0.7,
          }
        });

        aiRepliedText = geminiRes.text?.trim() || 'I am ready to assist you with Easy Click plans. How can I guide you today?';
      } catch (geminiError) {
        console.error('Error with raw Gemini API fallback:', geminiError);
        aiRepliedText = `Hello! Welcome to Easy Click Support. I can help approve deposit logs or walk you through our starter plan (PKR 300) with PKR 20 daily earnings, or the premium Diamond plan (PKR 10,000) yielding PKR 900 daily. All digital cash transfers are operated via EasyPaisa and JazzCash. Let me know what you want to achieve!`;
      }
    } else {
      // Offline mock responses based on rules
      const msgLower = message.toLowerCase();
      if (msgLower.includes('plan') || msgLower.includes('earn') || msgLower.includes('paisa')) {
        aiRepliedText = `Aura Premium Easy Click represents the fastest online mobile earning hub in Pakistan! You can buy our Starter Bronze plan at PKR 300 to claim PKR 20 daily profit or Diamond Plan at PKR 10,000 to earn PKR 900 daily from viewing basic interactive ads! Send payments directly using the Deposit screen via EasyPaisa / JazzCash!`;
      } else if (msgLower.includes('verify') || msgLower.includes('deposit') || msgLower.includes('withdraw')) {
        aiRepliedText = `Deposits are verified within a few hours. Please make sure to submit the exact Transaction ID (TXID) from JazzCash or EasyPaisa receipts into our Deposit request screen. When requesting a Withdrawal, ensure your account numbers are correctly entered.`;
      } else {
        aiRepliedText = `Greetings! I am Easy Click AI Support Bot. You can purchase investment plans starting from just PKR 300 to view daily ads and earn PKR 20 daily. We support fast deposits and withdrawals via JazzCash and EasyPaisa! Ask me anything regarding account registration or payments!`;
      }
    }

    const aiTimestamp = new Date().toISOString();
    session.messages.push({
      sender: 'ai',
      text: aiRepliedText,
      timestamp: aiTimestamp
    });

    session.updatedAt = aiTimestamp;
    writeDB(db);

    res.json({ reply: aiRepliedText, messages: session.messages });
  });

  // ==================== ADMIN PANEL APIs (Protected by custom header: x-admin-password: "2121") ====================
  app.get('/api/admin/summary', checkAdminPassword, (req, res) => {
    const db = readDB();
    const users = Object.values(db.users) as any[];
    const totalDepositedApproved = db.deposits
      .filter((d: any) => d.status === 'Approved')
      .reduce((sum: number, d: any) => sum + d.amount, 0);
    const totalWithdrawnApproved = db.withdrawals
      .filter((w: any) => w.status === 'Approved')
      .reduce((sum: number, w: any) => sum + w.amount, 0);
      
    const pendingDepositsCount = db.deposits.filter((d: any) => d.status === 'Pending').length;
    const pendingWithdrawalsCount = db.withdrawals.filter((w: any) => w.status === 'Pending').length;

    res.json({
      totalUsers: users.length,
      totalDepositedApproved,
      totalWithdrawnApproved,
      pendingDepositsCount,
      pendingWithdrawalsCount,
    });
  });

  app.get('/api/admin/deposits', checkAdminPassword, (req, res) => {
    const db = readDB();
    res.json(db.deposits || []);
  });

  app.post('/api/admin/deposits/:id/approve', checkAdminPassword, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const depositIndex = db.deposits.findIndex((d: any) => d.id === id);
    if (depositIndex === -1) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const deposit = db.deposits[depositIndex];
    if (deposit.status !== 'Pending') {
      return res.status(400).json({ error: `This deposit transaction is already completed as: ${deposit.status}` });
    }

    deposit.status = 'Approved';
    
    // Credit user check
    const user = db.users[deposit.username];
    if (user) {
      // If payment has a target planId, activate that plan automatically!
      if (deposit.planId) {
        const foundPlan = SYSTEM_PLANS.find((p: any) => p.id === deposit.planId);
        if (foundPlan) {
          user.activePlan = foundPlan.id;
          user.dailyAdsLeft = foundPlan.dailyAds;
        }
      }
      user.balance = parseFloat((user.balance + deposit.amount).toFixed(2));
      user.totalDeposited = parseFloat((user.totalDeposited + deposit.amount).toFixed(2));
    }

    writeDB(db);
    res.json({ message: 'Deposit successfully approved!', deposit });
  });

  app.post('/api/admin/deposits/:id/reject', checkAdminPassword, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const depositIndex = db.deposits.findIndex((d: any) => d.id === id);
    if (depositIndex === -1) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const deposit = db.deposits[depositIndex];
    if (deposit.status !== 'Pending') {
      return res.status(400).json({ error: 'This deposit is already completed' });
    }

    deposit.status = 'Rejected';
    writeDB(db);
    res.json({ message: 'Deposit rejected.', deposit });
  });

  app.get('/api/admin/withdrawals', checkAdminPassword, (req, res) => {
    const db = readDB();
    res.json(db.withdrawals || []);
  });

  app.post('/api/admin/withdrawals/:id/approve', checkAdminPassword, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const wthIndex = db.withdrawals.findIndex((w: any) => w.id === id);
    if (wthIndex === -1) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    const withdrawal = db.withdrawals[wthIndex];
    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({ error: `Withdrawal request already marked ${withdrawal.status}` });
    }

    withdrawal.status = 'Approved';
    
    const user = db.users[withdrawal.username];
    if (user) {
      user.totalWithdrawn = parseFloat((user.totalWithdrawn + withdrawal.amount).toFixed(2));
    }

    writeDB(db);
    res.json({ message: 'Withdrawal successfully marked as Approved!', withdrawal });
  });

  app.post('/api/admin/withdrawals/:id/reject', checkAdminPassword, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const wthIndex = db.withdrawals.findIndex((w: any) => w.id === id);
    if (wthIndex === -1) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    const withdrawal = db.withdrawals[wthIndex];
    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }

    withdrawal.status = 'Rejected';
    
    // Refund user balance!
    const user = db.users[withdrawal.username];
    if (user) {
      user.balance = parseFloat((user.balance + withdrawal.amount).toFixed(2));
    }

    writeDB(db);
    res.json({ message: 'Withdrawal rejected & refunded back to user balance successfully.', withdrawal });
  });

  app.get('/api/admin/chats', checkAdminPassword, (req, res) => {
    const db = readDB();
    const chats = Object.values(db.chats || {});
    res.json(chats);
  });

  app.get('/api/admin/chats/:username', checkAdminPassword, (req, res) => {
    const { username } = req.params;
    const db = readDB();
    const chat = db.chats[username.toLowerCase()];
    if (!chat) {
      return res.status(404).json({ error: 'No chat session found for user' });
    }
    res.json(chat);
  });

  // ==================== VITE DEVELOPMENT MIDDLEWARE ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend compiled bundle
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Easy Click Server] running and routing on http://localhost:${PORT}`);
  });
}

startServer();
