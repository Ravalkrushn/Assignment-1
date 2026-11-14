import React, { useState } from 'react';
import { 
  QrCode, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function CodeManagementPage() {
  const { codes, products, generateCodes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Generator form
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [codesCount, setCodesCount] = useState(10);
  const [customPoints, setCustomPoints] = useState('');

  const filteredCodes = codes.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage) || 1;
  const paginatedCodes = filteredCodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const result = await generateCodes({
        productId: selectedProductId,
        count: Number(codesCount),
        customPoints: customPoints ? Number(customPoints) : null
      });

      toast.success(`Generated ${result.count} new codes under ${result.batchId}!`, {
        style: { border: '2px solid black', borderRadius: '8px', fontWeight: 'bold' }
      });
      setIsGenerateModalOpen(false);
    } catch {
      toast.error('Failed to generate codes.');
    }
  };

  const handleExportCSV = () => {
    const headers = "Code,ProductName,SKU,Points,BatchNo,GeneratedDate,ExpiryDate,Status,RedeemedBy,RedeemedAt\n";
    const rows = filteredCodes.map(c => 
      `"${c.code}","${c.productName}","${c.sku}",${c.points},"${c.batchNo}","${c.generatedDate}","${c.expiryDate}","${c.status}","${c.redeemedBy || ''}","${c.redeemedAt || ''}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `loyaltybox_batch_codes_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Batch codes exported as CSV!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Unused':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-black rounded text-[10px] font-black uppercase">Unused</span>;
      case 'Redeemed':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-black rounded text-[10px] font-black uppercase">Redeemed</span>;
      case 'Expired':
        return <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 border border-black rounded text-[10px] font-black uppercase">Expired</span>;
      case 'Suspicious':
        return <span className="px-2 py-0.5 bg-red-100 text-red-900 border border-black rounded text-[10px] font-black uppercase">Suspicious</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <QrCode className="w-3.5 h-3.5" />
            Serialized Packaging Security
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Product Code Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Simulate cryptographic one-time authentication code batches for factory packaging lines, set points, and audit redemption statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-5 py-3 bg-black text-[#ffe17c] neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Batch</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-white text-black neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow-sm flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-700">
          ⚠️ <strong>Frontend Demonstration Mode:</strong> Codes are generated using deterministic simulation algorithms. In production, keys are HSM encrypted before printing.
        </span>
        <span className="font-mono font-bold bg-[#ffe17c] px-2 py-0.5 border border-black rounded">
          {codes.length} Codes Loaded
        </span>
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
            placeholder="Search code (e.g. BOX-GOLD), product, or batch..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'UNUSED', 'REDEEMED', 'EXPIRED', 'SUSPICIOUS'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                statusFilter === st ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Codes Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Unique Box Code</th>
                <th className="py-3 px-4">Associated Product</th>
                <th className="py-3 px-4">Reward Points</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Redemption Info</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {paginatedCodes.map((c) => (
                <tr key={c.code} className="hover:bg-[#fbfaf5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-black">
                    <span className="px-2 py-1 bg-[#f4f4f0] border border-black rounded">
                      {c.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-black">{c.productName}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{c.sku}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-[#ffe17c] text-black font-black text-xs border border-black rounded">
                      +{c.points} PTS
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-700 text-xs">
                    {c.batchNo}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 text-xs">
                    {c.expiryDate}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {c.redeemedBy ? (
                      <div>
                        <span className="font-bold text-black block truncate max-w-[150px]">{c.redeemedBy}</span>
                        <span className="text-[10px] text-neutral-400">{c.redeemedAt}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Not redeemed yet</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(c.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-[#fbfaf5] border-t-2 border-black flex items-center justify-between text-xs font-bold">
          <span className="text-neutral-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCodes.length)} of {filteredCodes.length} codes
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 bg-white neo-btn rounded-lg disabled:opacity-40"
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
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Batch Code Generation Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Product Packaging Codes"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Select Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku} • {p.pointsPerBox} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Number of Codes to Generate
              </label>
              <select
                value={codesCount}
                onChange={(e) => setCodesCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              >
                <option value={5}>5 Codes (Quick Test)</option>
                <option value={10}>10 Codes (Standard Batch)</option>
                <option value={25}>25 Codes</option>
                <option value={50}>50 Codes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Override Points (Optional)
              </label>
              <input
                type="number"
                placeholder="Default product points"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>
          </div>

          <div className="p-3 bg-[#ffe17c]/50 border border-black rounded-lg text-xs space-y-1">
            <p className="font-bold text-black">Batch Preview:</p>
            <p className="text-neutral-700">
              Codes will be formatted with prefix <code>BOX-XXXX-XXXX</code> and cryptographically hashed for single-use redemption over a 12-month validity period.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="w-1/2 py-2.5 bg-white text-black neo-btn rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-black"
            >
              Generate Batch
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
