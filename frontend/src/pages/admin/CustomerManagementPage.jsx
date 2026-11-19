import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const normalizeCustomer = (c) => {
  if (!c) return null;
  const name = c.name || c.fullName || 'Customer';
  const points = typeof c.pointsBalance === 'number' 
    ? c.pointsBalance 
    : (typeof c.availablePoints === 'number' ? c.availablePoints : 0);
  const earned = typeof c.totalPointsEarned === 'number' ? c.totalPointsEarned : 0;
  const boxes = typeof c.boxesRedeemed === 'number' ? c.boxesRedeemed : 0;
  const regDate = c.registeredDate || c.joinedDate || (c.createdAt ? new Date(c.createdAt).toISOString().substring(0, 10) : '2026-11-14');

  return {
    id: c.id || c._id || `CUST-${Math.random().toString(36).substring(2, 7)}`,
    _id: c._id || c.id,
    name,
    fullName: name,
    email: c.email || '',
    phone: c.phone || '',
    businessName: c.businessName || 'Workshop',
    city: c.city || '-',
    state: c.state || '-',
    tier: c.tier || 'Bronze',
    pointsBalance: points,
    totalPointsEarned: earned,
    boxesRedeemed: boxes,
    status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()) : 'Active',
    registeredDate: regDate,
    joinedDate: regDate
  };
};

export default function CustomerManagementPage() {
  const { customers: contextCustomers = [], transactions = [] } = useApp();
  const [customers, setCustomers] = useState(() => 
    Array.isArray(contextCustomers) ? contextCustomers.map(normalizeCustomer).filter(Boolean) : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Sync if context customers update
  useEffect(() => {
    if (Array.isArray(contextCustomers) && contextCustomers.length > 0) {
      setCustomers(contextCustomers.map(normalizeCustomer).filter(Boolean));
    }
  }, [contextCustomers]);

  // Fetch live from directory endpoint
  useEffect(() => {
    api.analytics.getDirectory({ limit: 100 })
      .then(res => {
        if (res?.success && Array.isArray(res?.data?.customers) && res.data.customers.length > 0) {
          setCustomers(res.data.customers.map(normalizeCustomer).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  const safeCustomerList = useMemo(() => {
    return (Array.isArray(customers) ? customers : []).map(normalizeCustomer).filter(Boolean);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return safeCustomerList.filter(c => {
      const q = (searchTerm || '').trim().toLowerCase();
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const emailMatch = (c.email || '').toLowerCase().includes(q);
      const businessMatch = (c.businessName || '').toLowerCase().includes(q);
      const cityMatch = (c.city || '').toLowerCase().includes(q);
      const matchesSearch = !q || nameMatch || emailMatch || businessMatch || cityMatch;
      
      const st = (c.status || '').toLowerCase();
      if (statusFilter === 'ACTIVE') return matchesSearch && st === 'active';
      if (statusFilter === 'INACTIVE') return matchesSearch && st !== 'active';
      return matchesSearch;
    });
  }, [safeCustomerList, searchTerm, statusFilter]);

  const getCustomerTransactions = (customerId) => {
    if (!Array.isArray(transactions) || !customerId) return [];
    return transactions.filter(t => t.customerId === customerId || t.userId === customerId);
  };

  const handleExportCSV = () => {
    const headers = "CustomerID,Name,Email,Phone,BusinessName,City,State,Tier,PointsBalance,TotalEarned,BoxesRedeemed,Status\n";
    const rows = filteredCustomers.map(c => 
      `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.businessName}","${c.city}","${c.state}","${c.tier}",${c.pointsBalance || 0},${c.totalPointsEarned || 0},${c.boxesRedeemed || 0},"${c.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `loyaltybox_customers_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer list exported as CSV!");
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Users className="w-3.5 h-3.5" />
            CRM Directory
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            View registered workshop clients, track box redemption loyalty balances, and audit individual customer history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-5 py-3 bg-white text-black neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Customer Directory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, workshop, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500">Status:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                statusFilter === st ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Customers Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Workshop / Company</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Points Balance</th>
                <th className="py-3 px-4">Boxes Scanned</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-500 font-medium">
                    No customers found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fbfaf5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{c.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-black">{c.name}</p>
                      <p className="text-[11px] text-neutral-500">{c.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700">{c.businessName}</td>
                    <td className="py-3.5 px-4 text-neutral-600">{c.city}, {c.state}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-[#ffe17c] text-black border border-black rounded text-[11px] font-black">
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black">
                      {(c.pointsBalance ?? 0).toLocaleString()} PTS
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700 font-bold">
                      {c.boxesRedeemed ?? 0} Boxes
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border border-black rounded ${
                        c.status.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 bg-black text-white neo-btn rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Profile & Ledger Details"
        maxWidth="max-w-2xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="p-4 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase bg-black text-[#ffe17c] px-2 py-0.5 rounded">
                  {selectedCustomer.tier}
                </span>
                <h4 className="font-heading font-black text-2xl text-black mt-1">
                  {selectedCustomer.name}
                </h4>
                <p className="text-xs text-neutral-800 font-semibold">
                  {selectedCustomer.businessName} • {selectedCustomer.city}, {selectedCustomer.state}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-black block">Available Points</span>
                <span className="font-heading font-black text-2xl text-black">
                  {(selectedCustomer.pointsBalance ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                <span className="text-neutral-500 font-bold block">Email:</span>
                <span className="font-semibold text-black truncate block">{selectedCustomer.email || '-'}</span>
              </div>
              <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                <span className="text-neutral-500 font-bold block">Mobile:</span>
                <span className="font-semibold text-black">{selectedCustomer.phone || '-'}</span>
              </div>
              <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                <span className="text-neutral-500 font-bold block">Boxes Scanned:</span>
                <span className="font-semibold text-black">{selectedCustomer.boxesRedeemed ?? 0} Units</span>
              </div>
              <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                <span className="text-neutral-500 font-bold block">Joined Date:</span>
                <span className="font-semibold text-black">{selectedCustomer.registeredDate || selectedCustomer.joinedDate || '-'}</span>
              </div>
            </div>

            {/* Recent Redemptions for this customer */}
            <div className="space-y-2">
              <h5 className="font-heading font-bold text-sm text-black">
                Recent Scans & Activity History
              </h5>
              <div className="max-h-48 overflow-y-auto border border-black rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbfaf5] border-b border-black text-neutral-600 font-bold uppercase">
                    <tr>
                      <th className="p-2">Tx ID</th>
                      <th className="p-2">Activity</th>
                      <th className="p-2">Points</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {getCustomerTransactions(selectedCustomer.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-neutral-500 font-medium">
                          No recent transactions found for this customer.
                        </td>
                      </tr>
                    ) : (
                      getCustomerTransactions(selectedCustomer.id).map(t => (
                        <tr key={t.id || t._id}>
                          <td className="p-2 font-mono">{t.id || t._id}</td>
                          <td className="p-2">{t.type === 'CODE_REDEMPTION' ? t.productName : t.rewardName}</td>
                          <td className="p-2 font-bold">{t.flow === 'EARNED' ? `+${t.points}` : `-${t.points}`}</td>
                          <td className="p-2 text-neutral-500">{t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-bold"
              >
                Close Customer Details
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
