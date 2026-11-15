import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function RedemptionHistoryPage() {
  const { transactions, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [liveRedemptions, setLiveRedemptions] = useState([]);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    api.redemptions.getMy({ limit: 50 })
      .then(res => {
        if (res?.success && Array.isArray(res?.data?.redemptions)) {
          setLiveRedemptions(res.data.redemptions);
        }
      })
      .catch(() => {});
  }, []);

  // Map redemptions to lookup
  const fulfillmentMap = {};
  liveRedemptions.forEach(r => {
    fulfillmentMap[r.redemptionCode] = r;
    fulfillmentMap[r._id] = r;
  });

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

  const getFulfillmentBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'delivered') {
      return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-black rounded text-[11px] font-black uppercase">Delivered</span>;
    }
    if (s === 'shipped') {
      return <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-black rounded text-[11px] font-black uppercase">Shipped</span>;
    }
    if (s === 'processing') {
      return <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-black rounded text-[11px] font-black uppercase">Processing</span>;
    }
    if (s === 'approved') {
      return <span className="px-2 py-0.5 bg-[#ffe17c] text-black border border-black rounded text-[11px] font-black uppercase">Approved</span>;
    }
    if (s === 'rejected') {
      return <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-black rounded text-[11px] font-black uppercase">Rejected</span>;
    }
    return <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-black rounded text-[11px] font-black uppercase">Pending</span>;
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
                <th className="py-3 px-4">Product Code / Ref</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Item / Activity</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Fulfillment / Status</th>
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
                paginated.map((tx) => {
                  const fulfillment = fulfillmentMap[tx.id] || (tx.flow === 'SPENT' ? {
                    redemptionCode: tx.id,
                    rewardName: tx.rewardName,
                    pointsSpent: tx.points,
                    status: tx.status || 'Pending',
                    carrier: 'Factory Direct Logistics',
                    trackingNumber: `TRK-${tx.id.replace('CLAIM-', '')}`,
                    expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                    timeline: [
                      { status: 'Pending', timestamp: new Date(), note: 'Order placed, pending plant approval.' }
                    ]
                  } : null);

                  return (
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
                          <div>
                            <span className="font-bold text-purple-900">{tx.rewardName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 text-xs">{tx.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.flow === 'SPENT' ? (
                          <button
                            onClick={() => setSelectedFulfillment(fulfillment)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#fbfaf5] border-2 border-black rounded-lg neo-shadow-sm hover:bg-[#ffe17c]"
                            title="Click to track fulfillment status"
                          >
                            <Truck className="w-3.5 h-3.5 text-black" />
                            {getFulfillmentBadge(fulfillment?.status || tx.status)}
                          </button>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 border border-black rounded-md">
                            {tx.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {/* Fulfillment Tracking Modal */}
      {selectedFulfillment && (
        <Modal
          isOpen={Boolean(selectedFulfillment)}
          onClose={() => setSelectedFulfillment(null)}
          title={`Order Fulfillment — ${selectedFulfillment.redemptionCode || selectedFulfillment.id}`}
        >
          <div className="space-y-6">
            <div className="p-4 bg-[#fbfaf5] border-2 border-black rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-base text-black">{selectedFulfillment.rewardName}</span>
                {getFulfillmentBadge(selectedFulfillment.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div>
                  <span className="text-neutral-500 font-bold block">Points Spent:</span>
                  <span className="font-black text-black">{selectedFulfillment.pointsSpent || selectedFulfillment.points} PTS</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Tracking Number:</span>
                  <span className="font-mono font-bold text-black">{selectedFulfillment.trackingNumber || 'Pending Generation'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Logistics Carrier:</span>
                  <span className="font-medium text-black">{selectedFulfillment.carrier || 'Factory Express Courier'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Expected Delivery:</span>
                  <span className="font-medium text-black">
                    {selectedFulfillment.expectedDeliveryDate
                      ? new Date(selectedFulfillment.expectedDeliveryDate).toLocaleDateString()
                      : 'Within 5-7 Business Days'}
                  </span>
                </div>
              </div>

              {selectedFulfillment.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 border-2 border-black rounded-lg text-xs">
                  <p className="font-bold text-red-800">Rejection Notice:</p>
                  <p className="text-red-700 mt-0.5">{selectedFulfillment.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600">
                Fulfillment Status Timeline
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-black ml-2">
                {(selectedFulfillment.timeline && selectedFulfillment.timeline.length > 0
                  ? selectedFulfillment.timeline
                  : [
                      { status: 'Order Submitted', timestamp: new Date(), note: 'Customer claimed reward from catalog.' },
                      { status: selectedFulfillment.status, timestamp: new Date(), note: `Current stage: ${selectedFulfillment.status}` }
                    ]
                ).map((step, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="absolute -left-[13px] top-1 w-3 h-3 rounded-full bg-[#ffe17c] border-2 border-black" />
                    <p className="font-heading font-black text-xs text-black">{step.status}</p>
                    <p className="text-[11px] text-neutral-600">{step.note}</p>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {step.timestamp ? new Date(step.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedFulfillment(null)}
                className="px-5 py-2 bg-black text-white neo-btn rounded-xl text-xs font-bold"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
