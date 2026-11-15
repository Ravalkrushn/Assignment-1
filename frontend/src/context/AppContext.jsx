import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialProducts } from '../data/dummyProducts';
import { initialRewards } from '../data/dummyRewards';
import { initialGeneratedCodes } from '../data/dummyCodes';
import { initialCustomers } from '../data/dummyCustomers';
import { initialTransactions } from '../data/dummyTransactions';
import { initialFraudAlerts } from '../data/dummyFraud';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Normalize user helper
  const normalizeUser = (u) => {
    if (!u) return null;
    return {
      ...u,
      id: u._id || u.id || "CUST-1001",
      name: u.fullName || u.name || "Rahul Sharma",
      fullName: u.fullName || u.name || "Rahul Sharma",
      email: u.email || "rahul.sharma@workshop.in",
      phone: u.phone || "+91 98765 43210",
      businessName: u.businessName || "Sharma Precision Engineering Works",
      city: u.city || "Pune",
      state: u.state || "Maharashtra",
      role: u.role || "customer",
      pointsBalance: u.availablePoints !== undefined ? u.availablePoints : (u.pointsBalance !== undefined ? u.pointsBalance : 1250),
      availablePoints: u.availablePoints !== undefined ? u.availablePoints : (u.pointsBalance !== undefined ? u.pointsBalance : 1250),
      totalPointsEarned: u.totalPointsEarned !== undefined ? u.totalPointsEarned : 2500,
      totalPointsRedeemed: u.totalPointsRedeemed !== undefined ? u.totalPointsRedeemed : 1250,
      boxesRedeemed: u.boxesRedeemed !== undefined ? u.boxesRedeemed : 25,
      tier: u.tier || "Gold VIP",
      avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
  };

  // Helper mapper for transactions
  const mapTransaction = (t) => ({
    id: t._id || t.id,
    customerId: t.userId || t.customerId,
    customerName: t.customerName || '',
    type: t.source || t.type || 'CODE_REDEMPTION',
    productCode: t.source === 'CODE_REDEMPTION' ? (t.referenceId || '-') : (t.productCode || '-'),
    productName: t.source === 'CODE_REDEMPTION' ? (t.description || t.productName) : (t.productName || '-'),
    rewardName: t.source === 'REWARD_CLAIM' ? (t.description || t.rewardName) : (t.rewardName || '-'),
    points: t.points,
    flow: t.flow || (t.points > 0 ? 'EARNED' : 'SPENT'),
    date: t.createdAt ? new Date(t.createdAt).toISOString().replace('T', ' ').substring(0, 16) : (t.date || ''),
    status: t.status || 'Completed'
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_user');
    return saved ? normalizeUser(JSON.parse(saved)) : normalizeUser({
      id: "CUST-1001",
      name: "Rahul Sharma",
      email: "rahul.sharma@workshop.in",
      phone: "+91 98765 43210",
      businessName: "Sharma Precision Engineering Works",
      city: "Pune",
      state: "Maharashtra",
      role: "customer",
      pointsBalance: 1250,
      availablePoints: 1250,
      totalPointsEarned: 2500,
      totalPointsRedeemed: 1250,
      boxesRedeemed: 25,
      tier: "Gold VIP",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    });
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_rewards');
    if (!saved) return initialRewards;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((item) => {
        const fallback = initialRewards.find((r) => r.id === item.id || r.name === item.name);
        return {
          ...item,
          image: fallback?.image || item.image || ''
        };
      });
    } catch {
      return initialRewards;
    }
  });

  const [codes, setCodes] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_codes');
    return saved ? JSON.parse(saved) : initialGeneratedCodes;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [fraudAlerts, setFraudAlerts] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_fraud');
    return saved ? JSON.parse(saved) : initialFraudAlerts;
  });

  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Synchronize with LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('loyaltybox_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('loyaltybox_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('loyaltybox_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('loyaltybox_codes', JSON.stringify(codes));
  }, [codes]);

  useEffect(() => {
    localStorage.setItem('loyaltybox_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('loyaltybox_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('loyaltybox_fraud', JSON.stringify(fraudAlerts));
  }, [fraudAlerts]);

  // Initial Sync from Backend if running
  const refreshBackendData = useCallback(async () => {
    try {
      const health = await api.health.check();
      if (health?.success) {
        setIsBackendOnline(true);
      }

      // 1. Sync User Profile if token exists
      const token = localStorage.getItem('loyaltybox_token');
      if (token) {
        try {
          const meRes = await api.auth.getMe();
          if (meRes?.success && meRes?.data?.user) {
            setCurrentUser(normalizeUser(meRes.data.user));
          }
          // Get live points balance
          const balanceRes = await api.points.getBalance();
          if (balanceRes?.success && balanceRes?.data) {
            const b = balanceRes.data.balance || balanceRes.data;
            setCurrentUser(prev => ({
              ...prev,
              pointsBalance: b.availablePoints ?? prev.pointsBalance,
              availablePoints: b.availablePoints ?? prev.availablePoints,
              totalPointsEarned: b.totalPointsEarned ?? prev.totalPointsEarned,
              totalPointsRedeemed: b.totalPointsRedeemed ?? prev.totalPointsRedeemed,
              tier: b.tier || prev.tier
            }));
          }
          // Get live points transactions
          const txRes = await api.points.getHistory({ limit: 50 });
          if (txRes?.success && txRes?.data?.transactions?.length > 0) {
            setTransactions(txRes.data.transactions.map(mapTransaction));
          }
        } catch {
          // Token may be invalid or expired; leave local session
        }
      }

      // 2. Fetch live products
      const prodRes = await api.products.getAll();
      if (prodRes?.success && Array.isArray(prodRes?.data?.products) && prodRes.data.products.length > 0) {
        setProducts(prodRes.data.products.map(p => ({
          id: p._id,
          _id: p._id,
          name: p.productName || p.name,
          productName: p.productName || p.name,
          sku: p.sku,
          category: p.category,
          pointsPerBox: p.pointsPerBox,
          price: p.price,
          status: typeof p.status === 'string' ? (p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase()) : 'Active',
          totalCodesGenerated: p.totalCodesGenerated || 0,
          totalRedeemed: p.totalRedeemed || 0,
          description: p.description || ''
        })));
      }

      // 3. Fetch live rewards
      const rewRes = await api.rewards.getAll();
      if (rewRes?.success && Array.isArray(rewRes?.data?.rewards) && rewRes.data.rewards.length > 0) {
        setRewards(rewRes.data.rewards.map(r => ({
          id: r._id,
          _id: r._id,
          name: r.name,
          pointsRequired: r.pointsRequired,
          category: r.category,
          quantity: r.quantity !== undefined ? r.quantity : (r.availableQuantity || 0),
          availableQuantity: r.quantity !== undefined ? r.quantity : (r.availableQuantity || 0),
          status: typeof r.status === 'string' ? (r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()) : 'Active',
          description: r.description || '',
          iconName: r.iconName || (r.category === 'Coupons' ? 'Ticket' : 'Gift'),
          tag: r.tag || ''
        })));
      }

      // 4. Fetch admin data if admin token is present
      if (token && currentUser?.role === 'admin') {
        const custRes = await api.analytics.getDirectory().catch(() => null);
        if (custRes?.success && Array.isArray(custRes?.data?.customers)) {
          setCustomers(custRes.data.customers);
        }

        const fraudRes = await api.fraud.getLogs().catch(() => null);
        if (fraudRes?.success && Array.isArray(fraudRes?.data?.logs)) {
          setFraudAlerts(fraudRes.data.logs);
        }
      }
    } catch {
      setIsBackendOnline(false);
    }
  }, [currentUser?.role]);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Fallback verification for offline or mock demo mode
  const fallbackVerifyAndRedeem = async (cleanCode) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const foundCode = codes.find(c => c.code.toUpperCase() === cleanCode);

    if (!foundCode) {
      return {
        success: false,
        status: 'INVALID',
        message: 'Invalid product code. Please verify the code printed inside your box.'
      };
    }

    if (foundCode.status === 'Redeemed') {
      return {
        success: false,
        status: 'ALREADY_REDEEMED',
        message: `This code was already redeemed on ${foundCode.redeemedAt || 'earlier date'}.`,
        details: foundCode
      };
    }

    if (foundCode.status === 'Expired') {
      return {
        success: false,
        status: 'EXPIRED',
        message: `This product code expired on ${foundCode.expiryDate}. Promotional period has ended.`,
        details: foundCode
      };
    }

    if (foundCode.status === 'Suspicious' || foundCode.status === 'Blocked') {
      return {
        success: false,
        status: 'SUSPICIOUS',
        message: 'Security Alert: This code has been flagged for abnormal activity. Contact support.',
        details: foundCode
      };
    }

    const pointsAwarded = foundCode.points || 100;
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    setCodes(prev => prev.map(c => 
      c.code.toUpperCase() === cleanCode
        ? { ...c, status: 'Redeemed', redeemedBy: currentUser.email, redeemedAt: formattedDate }
        : c
    ));

    setCurrentUser(prev => ({
      ...prev,
      pointsBalance: prev.pointsBalance + pointsAwarded,
      availablePoints: prev.pointsBalance + pointsAwarded,
      totalPointsEarned: prev.totalPointsEarned + pointsAwarded,
      boxesRedeemed: prev.boxesRedeemed + 1
    }));

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      type: "CODE_REDEMPTION",
      productCode: foundCode.code,
      productName: foundCode.productName,
      points: pointsAwarded,
      flow: "EARNED",
      date: formattedDate,
      status: "Completed",
      rewardName: "-"
    };

    setTransactions(prev => [newTxn, ...prev]);

    return {
      success: true,
      status: 'VALID',
      points: pointsAwarded,
      productName: foundCode.productName,
      message: `Awesome! ${pointsAwarded} points credited for "${foundCode.productName}".`
    };
  };

  // Main Secure Code Redemption method (Backend First with atomic database transaction)
  const verifyAndRedeemCode = async (codeString) => {
    const cleanCode = (codeString || '').trim().toUpperCase();

    try {
      const res = await api.codes.redeem(cleanCode);
      if (res?.success && res?.data) {
        const { pointsEarned, availablePoints, productName } = res.data;
        
        setCurrentUser(prev => ({
          ...prev,
          pointsBalance: availablePoints,
          availablePoints: availablePoints,
          totalPointsEarned: (prev.totalPointsEarned || 0) + pointsEarned,
          boxesRedeemed: (prev.boxesRedeemed || 0) + 1
        }));

        const now = new Date();
        const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);
        const newTxn = {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: currentUser?.id,
          customerName: currentUser?.name,
          type: "CODE_REDEMPTION",
          productCode: cleanCode,
          productName: productName,
          points: pointsEarned,
          flow: "EARNED",
          date: formattedDate,
          status: "Completed",
          rewardName: "-"
        };

        setTransactions(prev => [newTxn, ...prev]);

        // Mark code in local code list if present
        setCodes(prev => prev.map(c => 
          c.code.toUpperCase() === cleanCode
            ? { ...c, status: 'Redeemed', redeemedBy: currentUser?.email, redeemedAt: formattedDate }
            : c
        ));

        return {
          success: true,
          status: 'VALID',
          points: pointsEarned,
          productName: productName,
          message: res.message || `Awesome! ${pointsEarned} points credited for "${productName}".`
        };
      }
    } catch (err) {
      if (err.isOffline) {
        return fallbackVerifyAndRedeem(cleanCode);
      }

      const message = err.message || 'Invalid product code.';
      let status = 'INVALID';
      if (message.toLowerCase().includes('already been redeemed') || message.toLowerCase().includes('already redeemed')) {
        status = 'ALREADY_REDEEMED';
      } else if (message.toLowerCase().includes('expired')) {
        status = 'EXPIRED';
      } else if (message.toLowerCase().includes('blocked') || message.toLowerCase().includes('suspicious')) {
        status = 'SUSPICIOUS';
      }

      return {
        success: false,
        status,
        message
      };
    }
  };

  // Fallback Reward Claim
  const fallbackClaimReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId || r._id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found' };

    if (currentUser.pointsBalance < reward.pointsRequired) {
      return { 
        success: false, 
        message: `Insufficient points! You need ${reward.pointsRequired - currentUser.pointsBalance} more points.` 
      };
    }

    if ((reward.availableQuantity ?? reward.quantity) <= 0) {
      return { success: false, message: 'This reward is currently out of stock.' };
    }

    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    setCurrentUser(prev => ({
      ...prev,
      pointsBalance: prev.pointsBalance - reward.pointsRequired,
      availablePoints: prev.pointsBalance - reward.pointsRequired,
      totalPointsRedeemed: (prev.totalPointsRedeemed || 0) + reward.pointsRequired
    }));

    setRewards(prev => prev.map(r => 
      (r.id === rewardId || r._id === rewardId)
        ? { ...r, availableQuantity: Math.max(0, (r.availableQuantity || r.quantity || 1) - 1), quantity: Math.max(0, (r.quantity || 1) - 1) }
        : r
    ));

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      type: "REWARD_CLAIM",
      productCode: "-",
      productName: "-",
      points: reward.pointsRequired,
      flow: "SPENT",
      date: formattedDate,
      status: reward.category === "Coupons" || reward.category === "Gift Cards" ? "Delivered" : "Dispatched",
      rewardName: reward.name
    };

    setTransactions(prev => [newTxn, ...prev]);

    return {
      success: true,
      rewardName: reward.name,
      pointsDeducted: reward.pointsRequired,
      message: `Congratulations! You claimed ${reward.name}.`
    };
  };

  // Main Reward Claim method (Backend First)
  const claimReward = async (rewardId) => {
    try {
      const res = await api.rewards.claim(rewardId);
      if (res?.success && res?.data) {
        const { redemption, availablePoints } = res.data;

        setCurrentUser(prev => ({
          ...prev,
          pointsBalance: availablePoints,
          availablePoints: availablePoints,
          totalPointsRedeemed: (prev.totalPointsRedeemed || 0) + (redemption?.pointsSpent || 0)
        }));

        setRewards(prev => prev.map(r => 
          (r.id === rewardId || r._id === rewardId)
            ? { ...r, availableQuantity: Math.max(0, (r.availableQuantity || r.quantity || 1) - 1), quantity: Math.max(0, (r.quantity || 1) - 1) }
            : r
        ));

        const now = new Date();
        const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);
        const newTxn = {
          id: redemption?.redemptionCode || `CLAIM-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: currentUser?.id,
          customerName: currentUser?.name,
          type: "REWARD_CLAIM",
          productCode: "-",
          productName: "-",
          points: redemption?.pointsSpent || 0,
          flow: "SPENT",
          date: formattedDate,
          status: "Completed",
          rewardName: redemption?.rewardName || 'Reward'
        };

        setTransactions(prev => [newTxn, ...prev]);

        return {
          success: true,
          rewardName: redemption?.rewardName || 'Reward',
          pointsDeducted: redemption?.pointsSpent,
          message: res.message || `Congratulations! You claimed ${redemption?.rewardName}.`
        };
      }
    } catch (err) {
      if (err.isOffline) {
        return fallbackClaimReward(rewardId);
      }
      return {
        success: false,
        message: err.message || 'Reward claim failed.'
      };
    }
  };

  // Admin Code Generator (Backend First)
  const generateCodes = async ({ productId, count = 10, customPoints = null, expiryMonths = 12 }) => {
    try {
      const res = await api.codes.generate({
        productId,
        count: Number(count),
        customPoints: customPoints ? Number(customPoints) : undefined,
        expiryMonths: Number(expiryMonths)
      });

      if (res?.success && res?.data) {
        const { batchId, codes: newGenCodes } = res.data;
        const formattedCodes = newGenCodes.map(c => ({
          code: c.code,
          productName: c.productName || 'Industrial Bearing Box',
          productId: productId,
          sku: c.sku,
          points: c.points,
          batchNo: batchId,
          generatedDate: new Date().toISOString().substring(0, 10),
          expiryDate: c.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          status: "Unused",
          redeemedBy: null,
          redeemedAt: null
        }));

        setCodes(prev => [...formattedCodes, ...prev]);
        return { count, batchId, newCodes: formattedCodes };
      }
    } catch {
      // Local fallback
      const product = products.find(p => p.id === productId || p._id === productId) || products[0];
      const points = customPoints ? Number(customPoints) : product.pointsPerBox;
      const batchId = `BATCH-${new Date().getFullYear()}-Q4-${Math.floor(10 + Math.random() * 90)}`;
      const today = new Date().toISOString().substring(0, 10);
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

      const newCodes = [];
      const prefixes = ['BOX', 'PRO', 'REW', 'IND', 'QRX'];
      for (let i = 0; i < count; i++) {
        const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const numStr = Math.floor(1000 + Math.random() * 9000);
        newCodes.push({
          code: `${pfx}-${randStr}-${numStr}`,
          productName: product.name,
          productId: product.id,
          sku: product.sku,
          points: points,
          batchNo: batchId,
          generatedDate: today,
          expiryDate: expiry,
          status: "Unused",
          redeemedBy: null,
          redeemedAt: null
        });
      }

      setCodes(prev => [...newCodes, ...prev]);
      return { count, batchId, newCodes };
    }
  };

  // Product CRUD
  const addProduct = async (prod) => {
    try {
      const res = await api.products.create({
        productName: prod.name || prod.productName,
        sku: prod.sku,
        category: prod.category,
        pointsPerBox: Number(prod.pointsPerBox),
        price: Number(prod.price || 0),
        description: prod.description || ''
      });
      if (res?.success && res?.data?.product) {
        const p = res.data.product;
        const newProd = {
          id: p._id,
          _id: p._id,
          name: p.productName,
          sku: p.sku,
          category: p.category,
          pointsPerBox: p.pointsPerBox,
          price: p.price,
          status: 'Active',
          totalCodesGenerated: 0,
          totalRedeemed: 0,
          description: p.description
        };
        setProducts(prev => [newProd, ...prev]);
        return;
      }
    } catch {
      // Local fallback
    }

    const newProd = {
      ...prod,
      id: `PROD-00${products.length + 1}`,
      totalCodesGenerated: 0,
      totalRedeemed: 0
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = async (id, fields) => {
    try {
      await api.products.update(id, fields);
    } catch {
      // ignore
    }
    setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, ...fields } : p));
  };

  const deleteProduct = async (id) => {
    try {
      await api.products.delete(id);
    } catch {
      // ignore
    }
    setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
  };

  // Rewards CRUD
  const addReward = async (rew) => {
    try {
      const res = await api.rewards.create({
        name: rew.name,
        category: rew.category,
        pointsRequired: Number(rew.pointsRequired),
        quantity: Number(rew.availableQuantity || rew.quantity || 100),
        description: rew.description || '',
        tag: rew.tag || '',
        image: rew.image || ''
      });
      if (res?.success && res?.data?.reward) {
        const r = res.data.reward;
        const newRew = {
          id: r._id,
          _id: r._id,
          name: r.name,
          category: r.category,
          pointsRequired: r.pointsRequired,
          availableQuantity: r.quantity,
          status: 'Active',
          description: r.description,
          iconName: rew.iconName || 'Gift',
          tag: r.tag,
          image: r.image || rew.image || ''
        };
        setRewards(prev => [newRew, ...prev]);
        return;
      }
    } catch {
      // Local fallback
    }

    const newRew = {
      ...rew,
      id: `REW-00${rewards.length + 1}`
    };
    setRewards(prev => [newRew, ...prev]);
  };

  const updateReward = async (id, fields) => {
    try {
      await api.rewards.update(id, fields);
    } catch {
      // ignore
    }
    setRewards(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, ...fields } : r));
  };

  const deleteReward = async (id) => {
    try {
      await api.rewards.delete(id);
    } catch {
      // ignore
    }
    setRewards(prev => prev.filter(r => r.id !== id && r._id !== id));
  };

  // Profile update
  const updateProfile = async (data) => {
    try {
      const res = await api.auth.updateProfile(data);
      if (res?.success && res?.data?.user) {
        setCurrentUser(normalizeUser(res.data.user));
        return { success: true };
      }
    } catch {
      // ignore and update locally
    }
    setCurrentUser(prev => ({ ...prev, ...data }));
    return { success: true };
  };

  // Live Authentication Helper: Login
  const loginUser = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res?.success && res?.data) {
        const { user, accessToken, refreshToken } = res.data;
        if (accessToken) {
          localStorage.setItem('loyaltybox_token', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('loyaltybox_refresh_token', refreshToken);
        }
        const normalized = normalizeUser(user);
        setCurrentUser(normalized);
        setIsBackendOnline(true);
        refreshBackendData();
        return { success: true, user: normalized };
      }
    } catch (err) {
      if (err.isOffline) {
        // Fallback for demo logins
        const isAdm = email.toLowerCase().includes('admin') || email.toLowerCase().includes('factory');
        const demoUser = normalizeUser({
          id: isAdm ? 'ADMIN-001' : 'CUST-1001',
          name: isAdm ? 'Harish Patel (Factory Owner)' : 'Rahul Sharma',
          fullName: isAdm ? 'Harish Patel (Factory Owner)' : 'Rahul Sharma',
          email,
          role: isAdm ? 'admin' : 'customer',
          pointsBalance: isAdm ? 0 : 1250,
          availablePoints: isAdm ? 0 : 1250
        });
        setCurrentUser(demoUser);
        return { success: true, user: demoUser, isFallback: true };
      }
      throw err;
    }
  };

  // Live Authentication Helper: Register
  const registerUser = async (userData) => {
    try {
      const res = await api.auth.register(userData);
      if (res?.success && res?.data) {
        const { user, accessToken, refreshToken } = res.data;
        if (accessToken) {
          localStorage.setItem('loyaltybox_token', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('loyaltybox_refresh_token', refreshToken);
        }
        const normalized = normalizeUser(user);
        setCurrentUser(normalized);
        setIsBackendOnline(true);
        refreshBackendData();
        return { success: true, user: normalized };
      }
    } catch (err) {
      if (err.isOffline) {
        const demoUser = normalizeUser({
          id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: userData.fullName,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          businessName: userData.businessName || '',
          city: userData.city || '',
          state: userData.state || '',
          role: 'customer',
          pointsBalance: 100, // 100 welcome bonus points
          availablePoints: 100
        });
        setCurrentUser(demoUser);
        return { success: true, user: demoUser, isFallback: true };
      }
      throw err;
    }
  };

  // Logout Helper
  const logoutUser = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('loyaltybox_token');
    localStorage.removeItem('loyaltybox_refresh_token');
    localStorage.removeItem('loyaltybox_user');
  };

  const resetAllDemoData = () => {
    localStorage.clear();
    setProducts(initialProducts);
    setRewards(initialRewards);
    setCodes(initialGeneratedCodes);
    setCustomers(initialCustomers);
    setTransactions(initialTransactions);
    setFraudAlerts(initialFraudAlerts);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        products,
        rewards,
        codes,
        customers,
        transactions,
        fraudAlerts,
        setFraudAlerts,
        isBackendOnline,
        refreshBackendData,
        loginUser,
        registerUser,
        logoutUser,
        verifyAndRedeemCode,
        claimReward,
        generateCodes,
        addProduct,
        updateProduct,
        deleteProduct,
        addReward,
        updateReward,
        deleteReward,
        updateProfile,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
