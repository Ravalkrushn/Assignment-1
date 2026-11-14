import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function FraudMonitoringPage() {
  const { fraudAlerts, setFraudAlerts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    api.fraud.getLogs()
      .then(res => {
        if (res?.success && Array.isArray(res?.data?.logs) && res.data.logs.length > 0) {
          const liveLogs = res.data.logs.map(l => ({
            id: l._id || l.id,
            timestamp: l.createdAt ? new Date(l.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '2026-11-14 21:00',
            customerName: l.customerName || (l.userId?.fullName || 'Anonymous / Unknown'),
            ipAddress: l.ipAddress || '127.0.0.1',
            location: l.location || 'Pune, India',
            type: l.eventType || 'Suspicious Code Activity',
            riskLevel: l.riskLevel || 'Medium',
            details: l.description || 'Abnormal code scanning behavior detected',
            status: l.status || 'Pending Review'
          }));
          setFraudAlerts(liveLogs);
        }
      })
      .catch(() => {});
  }, [setFraudAlerts]);

  const filteredAlerts = fraudAlerts.filter(a => {
    const matchesSearch = 
      (a.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (riskFilter === 'ALL') return matchesSearch;
    return matchesSearch && a.riskLevel.toUpperCase() === riskFilter.toUpperCase();
  });

  const getRiskBadge = (level) => {
    switch (level) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] uppercase border border-black rounded shadow-[2px_2px_0px_0px_#000]">Critical</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 bg-amber-500 text-black font-black text-[10px] uppercase border border-black rounded shadow-[2px_2px_0px_0px_#000]">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 bg-yellow-300 text-black font-black text-[10px] uppercase border border-black rounded shadow-[2px_2px_0px_0px_#000]">Medium</span>;
      case 'Low':
        return <span className="px-2.5 py-0.5 bg-neutral-200 text-black font-black text-[10px] uppercase border border-black rounded shadow-[2px_2px_0px_0px_#000]">Low</span>;
      default:
        return <span>{level}</span>;
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.fraud.updateStatus(id, 'Resolved');
    } catch {}
    setFraudAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Resolved & Cleared' } : a
    ));
    toast.success(`Alert ${id} marked as resolved!`);
    setSelectedAlert(null);
  };

  const handleBlockOrigin = async (id) => {
    try {
      await api.fraud.updateStatus(id, 'Blacklisted');
      if (selectedAlert?.ipAddress) {
        await api.fraud.blockIp(selectedAlert.ipAddress, 'Admin manual blacklist');
      }
    } catch {}
    setFraudAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Permanently Blacklisted' } : a
    ));
    toast.error(`Origin IP / Account associated with ${id} blacklisted from code scanning.`);
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#171e19] text-white border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-xs font-black uppercase rounded neo-shadow-sm border border-black">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Threat Defense
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            Fraud & Abuse Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#b7c6c2] font-medium max-w-xl">
            Real-time heuristic threat detection monitoring automated brute-force code scans, duplicate retail redemptions, and suspicious high-velocity IP traffic.
          </p>
        </div>

        <div className="p-4 bg-[#243028] border-2 border-black rounded-xl text-xs space-y-1">
          <span className="text-[#ffe17c] font-black uppercase block tracking-wider">
            Active Defenses:
          </span>
          <div className="flex items-center gap-2 text-white font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rate Limiter: 5 scans/min
          </div>
          <div className="flex items-center gap-2 text-white font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Replay Defense: Enforced
          </div>
        </div>
      </div>

      {/* Security Disclaimer */}
      <div className="p-4 bg-amber-50 border-2 border-black rounded-xl neo-shadow-sm flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-800 font-medium">
          <strong>Frontend Demonstration Interface:</strong> This screen models heuristic fraud analysis, risk triage, and operator intervention workflows. In production environments, events are piped through edge WAF and Kafka streaming anomaly detectors.
        </div>
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
            placeholder="Search by incident ID, suspect IP, or anomaly type..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Risk Level:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                riskFilter === lvl ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

      </div>

      {/* Fraud Incidents Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Risk Severity</th>
                <th className="py-3 px-4">Suspect / Origin</th>
                <th className="py-3 px-4">Threat Pattern</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Incident Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#fbfaf5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-black">{alert.id}</td>
                  <td className="py-3.5 px-4">
                    {getRiskBadge(alert.riskLevel)}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-black">{alert.customerName}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{alert.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-neutral-900 block">{alert.type}</span>
                    <span className="text-[11px] text-neutral-500">{alert.location}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 font-black border border-black rounded text-xs">
                      {alert.attemptsCount} attempts
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 text-xs">{alert.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-bold text-neutral-800">
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-3 py-1.5 bg-black text-white neo-btn rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Alert Details Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Incident Forensic Analysis"
        maxWidth="max-w-xl"
      >
        {selectedAlert && (
          <div className="space-y-5">
            <div className="p-4 bg-red-50 border-2 border-black rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black">{selectedAlert.id}</span>
                {getRiskBadge(selectedAlert.riskLevel)}
              </div>
              <h4 className="font-heading font-black text-xl text-black">
                {selectedAlert.type}
              </h4>
              <p className="text-xs text-neutral-800 font-medium">
                {selectedAlert.pattern}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                  <span className="text-neutral-500 font-bold block">Suspect Identity:</span>
                  <span className="font-bold text-black">{selectedAlert.customerName}</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">{selectedAlert.email}</span>
                </div>
                <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                  <span className="text-neutral-500 font-bold block">Geo-Location:</span>
                  <span className="font-bold text-black">{selectedAlert.location}</span>
                </div>
              </div>

              <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                <span className="text-neutral-500 font-bold block">Targeted Product SKU:</span>
                <span className="font-bold text-black">{selectedAlert.targetedProduct}</span>
              </div>

              <div className="p-3 bg-[#fbfaf5] border border-black rounded-lg">
                <span className="text-neutral-500 font-bold block">Automated Action Taken:</span>
                <span className="font-semibold text-neutral-800">{selectedAlert.actionTaken}</span>
              </div>
            </div>

            {/* Operator Actions */}
            <div className="pt-2 border-t-2 border-black/10 flex gap-3">
              <button
                type="button"
                onClick={() => handleResolveAlert(selectedAlert.id)}
                className="w-1/2 py-2.5 bg-white text-emerald-800 neo-btn rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark Legitimate</span>
              </button>
              <button
                type="button"
                onClick={() => handleBlockOrigin(selectedAlert.id)}
                className="w-1/2 py-2.5 bg-red-600 text-white neo-btn rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Enforce Blacklist</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
