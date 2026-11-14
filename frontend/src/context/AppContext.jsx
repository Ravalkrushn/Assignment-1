import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProducts } from '../data/dummyProducts';
import { initialRewards } from '../data/dummyRewards';
import { initialGeneratedCodes } from '../data/dummyCodes';
import { initialCustomers } from '../data/dummyCustomers';
import { initialTransactions } from '../data/dummyTransactions';
import { initialFraudAlerts } from '../data/dummyFraud';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Current logged in user (Default to Rahul Sharma, gold customer)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_user');
    return saved ? JSON.parse(saved) : {
      id: "CUST-1001",
      name: "Rahul Sharma",
      email: "rahul.sharma@workshop.in",
      phone: "+91 98765 43210",
      businessName: "Sharma Precision Engineering Works",
      city: "Pune",
      state: "Maharashtra",
      role: "customer",
      pointsBalance: 1250,
      totalPointsEarned: 2500,
      totalPointsRedeemed: 1250,
      boxesRedeemed: 25,
      tier: "Gold VIP",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('loyaltybox_rewards');
    return saved ? JSON.parse(saved) : initialRewards;
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

  // Save changes to localStorage for realistic seamless navigation
  useEffect(() => {
    localStorage.setItem('loyaltybox_user', JSON.stringify(currentUser));
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

  // Code redemption simulation
  const verifyAndRedeemCode = async (codeString) => {
    const cleanCode = (codeString || '').trim().toUpperCase();

    // Artificial short delay to simulate verification
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Lookup code in database
    const foundCode = codes.find(c => c.code.toUpperCase() === cleanCode);

    if (!foundCode) {
      // Check if it looks like a valid code pattern or completely invalid
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

    if (foundCode.status === 'Suspicious') {
      return {
        success: false,
        status: 'SUSPICIOUS',
        message: 'Security Alert: This code has been flagged for abnormal activity. Contact support.',
        details: foundCode
      };
    }

    // Success state
    const pointsAwarded = foundCode.points || 100;
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    // Update code state
    setCodes(prev => prev.map(c => 
      c.code.toUpperCase() === cleanCode
        ? { ...c, status: 'Redeemed', redeemedBy: currentUser.email, redeemedAt: formattedDate }
        : c
    ));

    // Update current user points
    setCurrentUser(prev => ({
      ...prev,
      pointsBalance: prev.pointsBalance + pointsAwarded,
      totalPointsEarned: prev.totalPointsEarned + pointsAwarded,
      boxesRedeemed: prev.boxesRedeemed + 1
    }));

    // Add transaction
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

  // Reward claim simulation
  const claimReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found' };

    if (currentUser.pointsBalance < reward.pointsRequired) {
      return { 
        success: false, 
        message: `Insufficient points! You need ${reward.pointsRequired - currentUser.pointsBalance} more points.` 
      };
    }

    if (reward.availableQuantity <= 0) {
      return { success: false, message: 'This reward is currently out of stock.' };
    }

    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    // Deduct points
    setCurrentUser(prev => ({
      ...prev,
      pointsBalance: prev.pointsBalance - reward.pointsRequired,
      totalPointsRedeemed: (prev.totalPointsRedeemed || 0) + reward.pointsRequired
    }));

    // Deduct inventory
    setRewards(prev => prev.map(r => 
      r.id === rewardId ? { ...r, availableQuantity: Math.max(0, r.availableQuantity - 1) } : r
    ));

    // Add transaction
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

  // Admin Code Generator
  const generateCodes = ({ productId, count = 10, customPoints = null }) => {
    const product = products.find(p => p.id === productId) || products[0];
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
  };

  // Product CRUD
  const addProduct = (prod) => {
    const newProd = {
      ...prod,
      id: `PROD-00${products.length + 1}`,
      totalCodesGenerated: 0,
      totalRedeemed: 0
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id, fields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Rewards CRUD
  const addReward = (rew) => {
    const newRew = {
      ...rew,
      id: `REW-00${rewards.length + 1}`
    };
    setRewards(prev => [newRew, ...prev]);
  };

  const updateReward = (id, fields) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const deleteReward = (id) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  // Profile update
  const updateProfile = (data) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
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
