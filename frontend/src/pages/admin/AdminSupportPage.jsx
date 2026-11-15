import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  ShieldAlert, 
  User, 
  Lock, 
  EyeOff
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Reply form state
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.support.getAllTickets();
      if (res?.success && Array.isArray(res?.data?.tickets)) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenTicket = async (ticket) => {
    const tid = ticket._id || ticket.id;
    try {
      const res = await api.support.getTicketById(tid);
      if (res?.success && res.data?.ticket) {
        setSelectedTicket(res.data.ticket);
      } else {
        setSelectedTicket(ticket);
      }
    } catch {
      setSelectedTicket(ticket);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setSubmittingReply(true);
    const tid = selectedTicket._id || selectedTicket.id;
    try {
      const res = await api.support.replyTicket(tid, {
        message: replyMessage.trim(),
        isInternalNote
      });
      if (res?.success && res.data?.ticket) {
        setSelectedTicket(res.data.ticket);
        setReplyMessage('');
        setIsInternalNote(false);
        toast.success(isInternalNote ? 'Internal note added' : 'Reply sent to customer');
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to submit message');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    const tid = selectedTicket._id || selectedTicket.id;
    try {
      const res = await api.support.updateTicketStatus(tid, { status: newStatus });
      if (res?.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
        setTickets(prev => prev.map(t => (t._id === tid || t.id === tid) ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      toast.error('Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const tid = (t._id || t.id || '').toLowerCase();
    const customer = (t.customer?.fullName || '').toLowerCase();
    const email = (t.customer?.email || '').toLowerCase();
    const subject = (t.subject || '').toLowerCase();
    const code = (t.relatedCode || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = tid.includes(query) || customer.includes(query) || email.includes(query) || subject.includes(query) || code.includes(query);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalTickets = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-black text-xs rounded border border-black">Open</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 bg-[#ffe17c] text-black font-black text-xs rounded border border-black shadow-[1px_1px_0px_0px_#000]">In Progress</span>;
      case 'Waiting for Customer':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-xs rounded border border-black">Waiting</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 bg-emerald-400 text-black font-black text-xs rounded border border-black shadow-[1px_1px_0px_0px_#000]">Resolved</span>;
      case 'Closed':
        return <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 font-bold text-xs rounded border border-black">Closed</span>;
      default:
        return <span className="px-2 py-0.5 bg-white text-black font-bold text-xs rounded border border-black">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] uppercase rounded">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] uppercase rounded">High</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 font-bold text-[10px] uppercase rounded border border-black/30">{priority}</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#171e19] text-white border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffe17c] text-black text-xs font-black uppercase rounded neo-shadow-sm border border-black">
            <HelpCircle className="w-3.5 h-3.5" />
            Customer Operations
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            Support & Disputes
          </h1>
          <p className="text-xs sm:text-sm text-[#b7c6c2] font-medium max-w-xl">
            Triage customer scan disputes, resolve missing points, respond to fulfillment inquiries, and track private internal team investigation notes.
          </p>
        </div>

        <button 
          onClick={fetchTickets}
          disabled={loading}
          className="p-3 bg-[#ffe17c] text-black border-2 border-black rounded-xl neo-btn flex items-center gap-2 text-xs font-black self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Total Tickets</span>
          <p className="text-2xl font-black mt-1 text-black">{totalTickets}</p>
          <span className="text-[11px] text-neutral-500">All submitted customer inquiries</span>
        </div>
        <div className="p-4 bg-[#ffe17c]/30 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-800 uppercase block">Active / In Progress</span>
          <p className="text-2xl font-black mt-1 text-black">{openCount}</p>
          <span className="text-[11px] text-neutral-600">Requiring agent response</span>
        </div>
        <div className="p-4 bg-red-50 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-red-700 uppercase block">Urgent Disputes</span>
          <p className="text-2xl font-black mt-1 text-red-700">{urgentCount}</p>
          <span className="text-[11px] text-red-600">High priority SLA</span>
        </div>
        <div className="p-4 bg-emerald-50 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-emerald-800 uppercase block">Resolved</span>
          <p className="text-2xl font-black mt-1 text-emerald-800">{resolvedCount}</p>
          <span className="text-[11px] text-emerald-600">Successfully closed</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket ID, customer, email, subject, or code..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-black rounded-lg neo-shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Customer">Waiting for Customer</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-black rounded-lg neo-shadow-sm"
          >
            <option value="ALL">All Categories</option>
            <option value="Code Scan Issue">Code Scan Issue</option>
            <option value="Reward Delivery">Reward Delivery</option>
            <option value="Points Dispute">Points Dispute</option>
            <option value="Account Access">Account Access</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category & Priority</th>
                <th className="py-3 px-4">Subject & Details</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-500 font-bold">
                    No tickets found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const tid = t._id || t.id;
                  return (
                    <tr key={tid} className="hover:bg-[#fbfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-black">
                        #{tid?.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-black">{t.customer?.fullName || 'Customer'}</p>
                        <p className="text-[11px] text-neutral-500 font-mono">{t.customer?.email || 'N/A'}</p>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <span className="font-bold text-black block">{t.category}</span>
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-black truncate">{t.subject}</p>
                        {t.relatedCode && (
                          <span className="text-[10px] font-mono text-neutral-600 font-bold block">
                            Code: {t.relatedCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 text-xs">
                        {new Date(t.updatedAt || t.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenTicket(t)}
                          className="px-3 py-1.5 bg-[#ffe17c] text-black border-2 border-black rounded-lg text-xs font-black neo-btn inline-flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Resolve</span>
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

      {/* Admin Dispute & Resolution Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Dispute Investigation & Resolution Center"
        maxWidth="max-w-2xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="p-4 bg-[#fbfaf5] border-2 border-black rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black">#{selectedTicket._id || selectedTicket.id}</span>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>
              <h3 className="font-heading font-black text-lg text-black">
                {selectedTicket.subject}
              </h3>
              <p className="text-xs text-neutral-800 font-medium">
                {selectedTicket.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10 text-xs">
                <div>
                  <span className="text-neutral-500 font-bold block">Customer:</span>
                  <span className="font-bold text-black">{selectedTicket.customer?.fullName} ({selectedTicket.customer?.email})</span>
                </div>
                {selectedTicket.relatedCode && (
                  <div>
                    <span className="text-neutral-500 font-bold block">Related Box Code:</span>
                    <span className="font-mono font-bold text-black">{selectedTicket.relatedCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Change Control */}
            <div className="p-3 bg-neutral-100 border border-black rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-black">Change Ticket Status:</span>
              <div className="flex gap-1.5">
                {['In Progress', 'Waiting for Customer', 'Resolved', 'Closed'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(s)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border border-black ${
                      selectedTicket.status === s ? 'bg-[#ffe17c] font-black neo-shadow-sm' : 'bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-600">
                Message History & Internal Audit Notes
              </h5>
              
              <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-neutral-50 border-2 border-black rounded-xl">
                {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                  <p className="text-xs text-neutral-500 italic text-center py-2">
                    No messages recorded. Send a reply or document an internal investigation note below.
                  </p>
                ) : (
                  selectedTicket.messages.map((m, idx) => {
                    const isInternal = m.isInternalNote;
                    const isAdmin = m.senderRole === 'Admin';
                    
                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border-2 border-black text-xs space-y-1 ${
                          isInternal 
                            ? 'bg-amber-100 border-amber-800 ml-6 neo-shadow-sm' 
                            : isAdmin 
                              ? 'bg-[#ffe17c] ml-8 neo-shadow-sm' 
                              : 'bg-white mr-8 neo-shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-4 text-[10px] font-black">
                          <span className="flex items-center gap-1">
                            {isInternal ? (
                              <span className="text-amber-800 flex items-center gap-1 font-black uppercase">
                                <Lock className="w-3 h-3" /> Private Internal Note (Staff Only)
                              </span>
                            ) : isAdmin ? (
                              <span>🛡️ Staff Admin ({m.sender?.fullName || 'Agent'})</span>
                            ) : (
                              <span>👤 Customer ({m.sender?.fullName || 'Customer'})</span>
                            )}
                          </span>
                          <span className="text-neutral-600">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-black font-medium whitespace-pre-wrap">{m.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Admin Reply & Internal Note Form */}
            <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t-2 border-black/10">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="w-4 h-4 rounded border-black accent-amber-500"
                  />
                  <span className={isInternalNote ? 'text-amber-800 font-black' : ''}>
                    Record as Private Internal Note (Hidden from Customer)
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={isInternalNote ? "Document internal investigation findings or audit notes..." : "Type response to customer..."}
                  className={`flex-1 px-3 py-2 text-xs bg-white neo-input rounded-xl border-2 border-black font-medium text-black ${
                    isInternalNote ? 'bg-amber-50 border-amber-700' : ''
                  }`}
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  className={`px-4 py-2 border-2 border-black rounded-xl text-xs font-black neo-btn flex items-center gap-1.5 ${
                    isInternalNote ? 'bg-amber-400 text-black' : 'bg-black text-[#ffe17c]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isInternalNote ? 'Log Note' : 'Reply'}</span>
                </button>
              </div>
            </form>

          </div>
        )}
      </Modal>

    </div>
  );
}
