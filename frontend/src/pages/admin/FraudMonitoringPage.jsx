import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle2, 
  Info,
  AlertTriangle,
  UserX,
  UserCheck,
  FileText,
  Send,
  Activity,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function FraudMonitoringPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.fraud.getLogs();
      if (res?.success && Array.isArray(res?.data?.logs)) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      toast.error('Failed to load fraud incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(a => {
    const id = (a._id || a.id || '').toLowerCase();
    const customer = (a.userId?.fullName || a.customerName || '').toLowerCase();
    const email = (a.userId?.email || a.email || '').toLowerCase();
    const ip = (a.ipAddress || '').toLowerCase();
    const type = (a.eventType || a.type || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = id.includes(query) || customer.includes(query) || email.includes(query) || ip.includes(query) || type.includes(query);
    const matchesRisk = riskFilter === 'ALL' || (a.riskLevel || '').toUpperCase() === riskFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || (a.status || '') === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Calculate metrics
  const totalIncidents = logs.length;
  const criticalCount = logs.filter(l => (l.riskScore >= 75) || l.riskLevel === 'Critical').length;
  const underReviewCount = logs.filter(l => l.status === 'Under Review' || l.status === 'Pending Review').length;
  const resolvedCount = logs.filter(l => l.status === 'Resolved' || l.status === 'False Positive').length;
  const avgRiskScore = totalIncidents > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / totalIncidents) 
    : 0;

  const getRiskBadge = (level, score) => {
    let bg = 'bg-neutral-200 text-black';
    if (level === 'Critical' || score >= 75) bg = 'bg-red-600 text-white';
    else if (level === 'High' || score >= 50) bg = 'bg-amber-500 text-black';
    else if (level === 'Medium' || score >= 25) bg = 'bg-yellow-300 text-black';

    return (
      <div className="inline-flex items-center gap-1.5">
        <span className={`px-2 py-0.5 font-black text-[10px] uppercase border border-black rounded shadow-[2px_2px_0px_0px_#000] ${bg}`}>
          {level || 'Low'}
        </span>
        {typeof score === 'number' && (
          <span className="font-mono text-xs font-black bg-white px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_0px_#000]">
            {score}/100
          </span>
        )}
      </div>
    );
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.fraud.updateStatus(id, newStatus, `Status transitioned to ${newStatus}`);
      if (res?.success) {
        toast.success(`Incident status updated to ${newStatus}`);
        setLogs(prev => prev.map(l => (l._id === id || l.id === id) ? { ...l, status: newStatus } : l));
        if (selectedAlert && (selectedAlert._id === id || selectedAlert.id === id)) {
          setSelectedAlert(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error('Failed to update incident status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedAlert) return;

    setSubmittingNote(true);
    const alertId = selectedAlert._id || selectedAlert.id;
    try {
      const res = await api.fraud.addNote(alertId, newNote.trim());
      if (res?.success) {
        toast.success('Investigation note recorded');
        setNewNote('');
        // Update local alert
        const updatedAlert = res.data?.fraudLog || {
          ...selectedAlert,
          investigationNotes: [
            ...(selectedAlert.investigationNotes || []),
            { note: newNote.trim(), createdAt: new Date().toISOString(), addedBy: { fullName: 'Admin' } }
          ]
        };
        setSelectedAlert(updatedAlert);
        setLogs(prev => prev.map(l => (l._id === alertId || l.id === alertId) ? updatedAlert : l));
      }
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleToggleCustomerBlock = async () => {
    if (!selectedAlert?.userId) return;
    const userId = typeof selectedAlert.userId === 'object' ? selectedAlert.userId._id : selectedAlert.userId;
    const isCurrentlyBlocked = typeof selectedAlert.userId === 'object' ? selectedAlert.userId.isBlocked : selectedAlert.isBlocked;

    setBlockLoading(true);
    try {
      if (isCurrentlyBlocked) {
        await api.fraud.unblockCustomer(userId);
        toast.success('Customer account unblocked successfully');
        if (typeof selectedAlert.userId === 'object') {
          selectedAlert.userId.isBlocked = false;
        }
      } else {
        const reason = prompt('Enter justification for locking customer account:', 'Suspected automated code scanning abuse');
        if (!reason) {
          setBlockLoading(false);
          return;
        }
        await api.fraud.blockCustomer(userId, reason);
        toast.error('Customer account has been blocked and session revoked');
        if (typeof selectedAlert.userId === 'object') {
          selectedAlert.userId.isBlocked = true;
        }
      }
      fetchLogs();
    } catch (err) {
      toast.error('Operation failed on customer account');
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#171e19] text-white border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-xs font-black uppercase rounded neo-shadow-sm border border-black">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Intelligence & Fraud Triage
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            Fraud Investigation
          </h1>
          <p className="text-xs sm:text-sm text-[#b7c6c2] font-medium max-w-xl">
            Rule-based threat scoring (0–100), automated pattern detection, forensic investigation notes, and customer account safety enforcement.
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="p-3 bg-[#ffe17c] text-black border-2 border-black rounded-xl neo-btn flex items-center gap-2 text-xs font-black self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Total Incidents</span>
          <p className="text-2xl font-black mt-1 text-black">{totalIncidents}</p>
          <span className="text-[11px] text-neutral-500">All recorded security events</span>
        </div>
        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Average Risk Score</span>
          <p className={`text-2xl font-black mt-1 ${avgRiskScore >= 50 ? 'text-red-600' : 'text-neutral-900'}`}>
            {avgRiskScore} <span className="text-xs font-bold text-neutral-500">/ 100</span>
          </p>
          <span className="text-[11px] text-neutral-500">Aggregated heuristic score</span>
        </div>
        <div className="p-4 bg-red-50 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-red-700 uppercase block">Critical Threats</span>
          <p className="text-2xl font-black mt-1 text-red-700">{criticalCount}</p>
          <span className="text-[11px] text-red-600">Requires urgent investigation</span>
        </div>
        <div className="p-4 bg-[#ffe17c]/30 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-800 uppercase block">Under Review</span>
          <p className="text-2xl font-black mt-1 text-black">{underReviewCount}</p>
          <span className="text-[11px] text-neutral-600">{resolvedCount} resolved to date</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by incident ID, suspect name, email, IP, or threat..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-500">Risk:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                  riskFilter === lvl ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-black rounded-lg neo-shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Fraud Incidents Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Risk Severity & Score</th>
                <th className="py-3 px-4">Suspect / Customer</th>
                <th className="py-3 px-4">Threat Pattern</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-500 font-bold">
                    No fraud incidents match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((alert) => {
                  const alertId = alert._id || alert.id;
                  const customerName = alert.userId?.fullName || alert.customerName || 'Anonymous / Unknown';
                  const email = alert.userId?.email || alert.email || 'N/A';
                  const riskScore = alert.riskScore ?? 45;
                  const riskLevel = alert.riskLevel || 'Medium';

                  return (
                    <tr key={alertId} className="hover:bg-[#fbfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-black">{alertId?.substring(0, 8)}...</td>
                      <td className="py-3.5 px-4">
                        {getRiskBadge(riskLevel, riskScore)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-black flex items-center gap-1.5">
                          {customerName}
                          {alert.userId?.isBlocked && (
                            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-black uppercase rounded">Blocked</span>
                          )}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">{email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-900 block">{alert.eventType || alert.type}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">{alert.ipAddress || '127.0.0.1'} ({alert.location || 'Local'})</span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 text-xs">
                        {new Date(alert.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={alert.status || 'Pending Review'}
                          onChange={(e) => handleStatusChange(alertId, e.target.value)}
                          className="px-2 py-1 text-xs font-bold bg-white border border-black rounded shadow-[2px_2px_0px_0px_#000]"
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Resolved">Resolved</option>
                          <option value="False Positive">False Positive</option>
                          <option value="Blacklisted">Blacklisted</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-3 py-1.5 bg-[#ffe17c] text-black border-2 border-black rounded-lg text-xs font-black neo-btn flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Investigate</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Investigation Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Forensic Threat Investigation & Notes"
        maxWidth="max-w-2xl"
      >
        {selectedAlert && (
          <div className="space-y-6">
            
            {/* Top Score Banner */}
            <div className={`p-4 border-2 border-black rounded-xl space-y-2 ${
              (selectedAlert.riskScore >= 75 || selectedAlert.riskLevel === 'Critical') ? 'bg-red-50' : 'bg-[#fbfaf5]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black">{selectedAlert._id || selectedAlert.id}</span>
                {getRiskBadge(selectedAlert.riskLevel, selectedAlert.riskScore ?? 45)}
              </div>
              <h4 className="font-heading font-black text-xl text-black">
                {selectedAlert.eventType || selectedAlert.type}
              </h4>
              <p className="text-xs text-neutral-800 font-medium">
                {selectedAlert.description || selectedAlert.details || 'Suspicious pattern identified by heuristic risk scorer.'}
              </p>
            </div>

            {/* Suspect Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-black rounded-lg neo-shadow-sm">
                <span className="text-neutral-500 font-bold block">Customer:</span>
                <span className="font-bold text-black">{selectedAlert.userId?.fullName || selectedAlert.customerName || 'Anonymous'}</span>
                <span className="text-[10px] text-neutral-500 block truncate">{selectedAlert.userId?.email || selectedAlert.email}</span>
              </div>
              <div className="p-3 bg-white border border-black rounded-lg neo-shadow-sm">
                <span className="text-neutral-500 font-bold block">Origin IP & Geo:</span>
                <span className="font-bold text-black font-mono">{selectedAlert.ipAddress || '127.0.0.1'}</span>
                <span className="text-[10px] text-neutral-500 block">{selectedAlert.location || 'Unknown'}</span>
              </div>
              <div className="p-3 bg-white border border-black rounded-lg neo-shadow-sm">
                <span className="text-neutral-500 font-bold block">Code Attempted:</span>
                <span className="font-bold text-black font-mono">{selectedAlert.attemptedCode || 'N/A'}</span>
              </div>
            </div>

            {/* Account Enforcement Controls */}
            {selectedAlert.userId && (
              <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-black flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Customer Account Security Action
                  </h5>
                  <p className="text-xs text-neutral-600">
                    Status: {selectedAlert.userId?.isBlocked ? (
                      <span className="text-red-700 font-black">LOCKED & REVOKED</span>
                    ) : (
                      <span className="text-emerald-700 font-black">ACTIVE & PERMITTED</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCustomerBlock}
                  disabled={blockLoading}
                  className={`px-4 py-2 text-xs font-black rounded-xl border-2 border-black neo-btn flex items-center gap-2 ${
                    selectedAlert.userId?.isBlocked ? 'bg-emerald-400 text-black' : 'bg-red-600 text-white'
                  }`}
                >
                  {selectedAlert.userId?.isBlocked ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Unblock Customer</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      <span>Lock & Block Customer</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Investigation Notes Thread */}
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-black flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Forensic Investigation Notes ({selectedAlert.investigationNotes?.length || 0})
              </h5>

              <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-[#fbfaf5] border-2 border-black rounded-xl">
                {(!selectedAlert.investigationNotes || selectedAlert.investigationNotes.length === 0) ? (
                  <p className="text-xs text-neutral-500 italic text-center py-2">
                    No investigation notes recorded yet. Add one below to track evidence.
                  </p>
                ) : (
                  selectedAlert.investigationNotes.map((n, idx) => (
                    <div key={idx} className="p-2.5 bg-white border border-black rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold">
                        <span>{n.addedBy?.fullName || n.addedBy || 'Security Analyst'}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-neutral-900 font-medium">{n.note}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record investigation findings or evidence..."
                  className="flex-1 px-3 py-2 text-xs bg-white neo-input rounded-xl border-2 border-black font-medium text-black"
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="px-4 py-2 bg-[#ffe17c] text-black border-2 border-black rounded-xl text-xs font-black neo-btn flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </form>
            </div>

            {/* Modal Footer Quick Actions */}
            <div className="pt-3 border-t-2 border-black/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange(selectedAlert._id || selectedAlert.id, 'False Positive')}
                className="px-3 py-2 bg-neutral-100 text-neutral-800 border-2 border-black rounded-xl text-xs font-bold neo-btn"
              >
                Mark False Positive
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedAlert._id || selectedAlert.id, 'Resolved')}
                className="px-4 py-2 bg-emerald-400 text-black border-2 border-black rounded-xl text-xs font-black neo-btn flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolve Incident</span>
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
