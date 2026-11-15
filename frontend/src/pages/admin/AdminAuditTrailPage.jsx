import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  User, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminAuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.audit.getLogs({
        search: searchTerm,
        module: moduleFilter !== 'ALL' ? moduleFilter : undefined,
        page: currentPage,
        limit: 12
      });
      if (res?.success && Array.isArray(res?.data?.logs)) {
        setLogs(res.data.logs);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, moduleFilter, currentPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const modules = ['ALL', 'Products', 'Rewards', 'Fulfillment', 'Codes', 'Customers', 'Fraud', 'Settings', 'Support', 'Campaigns'];

  const getModuleBadge = (mod) => {
    const colors = {
      Products: 'bg-blue-100 text-blue-900',
      Rewards: 'bg-purple-100 text-purple-900',
      Fulfillment: 'bg-emerald-100 text-emerald-900',
      Codes: 'bg-amber-100 text-amber-900',
      Customers: 'bg-indigo-100 text-indigo-900',
      Fraud: 'bg-red-100 text-red-900',
      Settings: 'bg-neutral-200 text-neutral-800',
      Support: 'bg-yellow-100 text-yellow-900',
      Campaigns: 'bg-pink-100 text-pink-900'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-black ${colors[mod] || 'bg-neutral-100 text-black'}`}>
        {mod}
      </span>
    );
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,Admin,Email,Module,ActionType,Description,IPAddress\n";
    const rows = logs.map(l => 
      `"${l.createdAt}","${l.adminName}","${l.adminEmail}","${l.module}","${l.actionType}","${l.description}","${l.ipAddress}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `loyaltybox_admin_audit_trail.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit trail log exported as CSV!");
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <FileText className="w-3.5 h-3.5" />
            Compliance & Governance
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Admin Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Immutable system audit logs tracking all administrative actions, catalog modifications, security decisions, and fulfillment overrides.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3 bg-white text-black neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by action, admin, or description..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-neutral-500">Module:</span>
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => {
                setModuleFilter(m);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                moduleFilter === m ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Activity Description</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-medium">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#fbfaf5] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-neutral-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-black">{log.adminName}</p>
                      <p className="text-[11px] text-neutral-500 font-mono">{log.adminEmail}</p>
                    </td>
                    <td className="py-3.5 px-4">{getModuleBadge(log.module)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-neutral-800">
                      {log.actionType}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-black">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs font-bold bg-white neo-btn rounded-lg border-2 border-black"
                        title="View raw payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
            Page {currentPage} of {totalPages}
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

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record — ${selectedLog.actionType}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#fbfaf5] border-2 border-black rounded-xl">
              <div>
                <span className="text-neutral-500 font-bold block">Administrator:</span>
                <span className="font-bold text-black">{selectedLog.adminName} ({selectedLog.adminEmail})</span>
              </div>
              <div>
                <span className="text-neutral-500 font-bold block">Timestamp:</span>
                <span className="font-mono text-black">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-bold block">Module:</span>
                <span className="font-bold text-black">{selectedLog.module}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-bold block">Target ID:</span>
                <span className="font-mono text-black">{selectedLog.targetId || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 font-bold block">Origin IP:</span>
                <span className="font-mono text-black">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-neutral-600 font-black uppercase text-[11px]">Activity Description:</span>
              <p className="p-3 bg-white border-2 border-black rounded-lg font-medium text-black">
                {selectedLog.description}
              </p>
            </div>

            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div className="space-y-1.5">
                <span className="text-neutral-600 font-black uppercase text-[11px]">Sanitized Event Metadata:</span>
                <pre className="p-3 bg-black text-emerald-400 font-mono text-[11px] rounded-lg border-2 border-black overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-black text-white neo-btn rounded-xl text-xs font-bold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
