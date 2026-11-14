import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RedeemCodePage from './pages/customer/RedeemCodePage';
import MyPointsPage from './pages/customer/MyPointsPage';
import RewardsPage from './pages/customer/RewardsPage';
import RedemptionHistoryPage from './pages/customer/RedemptionHistoryPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import CodeManagementPage from './pages/admin/CodeManagementPage';
import RewardsManagementPage from './pages/admin/RewardsManagementPage';
import RedemptionManagementPage from './pages/admin/RedemptionManagementPage';
import FraudMonitoringPage from './pages/admin/FraudMonitoringPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Global Toast Notifications with Neo-Brutalist styling */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              border: '2px solid #000000',
              padding: '12px 16px',
              color: '#171e19',
              boxShadow: '4px 4px 0px 0px #000000',
              borderRadius: '12px',
              fontFamily: 'Satoshi, sans-serif',
              fontWeight: 700,
              fontSize: '13px'
            },
            success: {
              iconTheme: {
                primary: '#171e19',
                secondary: '#ffe17c'
              }
            },
            error: {
              style: {
                border: '2px solid #000000',
                backgroundColor: '#fff5f5',
                color: '#991b1b',
                boxShadow: '4px 4px 0px 0px #000000'
              }
            }
          }}
        />

        <Routes>
          {/* Public & Authentication Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Customer Portal Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="redeem-code" element={<RedeemCodePage />} />
            <Route path="points" element={<MyPointsPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="history" element={<RedemptionHistoryPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
          </Route>

          {/* Factory Admin Portal Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="codes" element={<CodeManagementPage />} />
            <Route path="rewards" element={<RewardsManagementPage />} />
            <Route path="redemptions" element={<RedemptionManagementPage />} />
            <Route path="fraud-monitoring" element={<FraudMonitoringPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all 404 redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
