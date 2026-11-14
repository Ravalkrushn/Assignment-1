import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function RedemptionHistoryPage() {
  const { transactions, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter records
  const userTransactions = transactions.filter(t => t.customerId === currentUser.id);

  const filtered = userTransactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.rewardName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'EARNED') return matchesSearch && t.flow === 'EARNED';
    if (filterType === 'SPENT') return matchesSearch && t.flow === 'SPENT';
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = "TransactionID,Type,ProductCode,Description,Points,Flow,Date,Status\n";
    const rows = filtered.map(t => 
      `"${t.id}","${t.type}","${t.productCode}","${t.flow === 'EARNED' ? t.productName : t.rewardName}",${t.points},"${t.flow}","${t.date}","${t.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `loyaltybox_history_${currentUser.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction statement exported as CSV!");
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <History className="w-3.5 h-3.5" />
            Audit Ledger
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Redemption History
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Complete transaction record of all scanned box codes, earned loyalty points, and claimed factory catalog rewards.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3 bg-white text-black neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by code, product name, or reward..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500">Filter:</span>
          {['ALL', 'EARNED', 'SPENT'].map((ft) => (
            <button
              key={ft}
              onClick={() => {
                setFilterType(ft);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                filterType === ft ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              {ft === 'ALL' ? 'All Activities' : ft === 'EARNED' ? 'Box Codes (Earned)' : 'Rewards (Spent)'}
            </button>
          ))}
        </div>

      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Product Code</th>
                <th className="py-3 px-4">Points Earned / Spent</th>
                <th className="py-3 px-4">Reward Redeemed / Item</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#fbfaf5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{tx.id}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700">
                      {tx.productCode !== '-' ? (
                        <span className="px-2 py-0.5 bg-[#f4f4f0] border border-black rounded font-bold">
                          {tx.productCode}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-xs border border-black ${
                        tx.flow === 'EARNED' ? 'bg-[#ffe17c] text-black' : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {tx.flow === 'EARNED' ? `+${tx.points}` : `-${tx.points}`} PTS
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.type === 'CODE_REDEMPTION' ? (
                        <span className="font-bold text-black">{tx.productName}</span>
                      ) : (
                        <span className="font-bold text-purple-900">{tx.rewardName}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 text-xs">{tx.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 border border-black rounded-md">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-[#fbfaf5] border-t-2 border-black flex items-center justify-between text-xs font-bold">
          <span className="text-neutral-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} records
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 bg-white neo-btn rounded-lg disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-white border-2 border-black rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-white neo-btn rounded-lg disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
