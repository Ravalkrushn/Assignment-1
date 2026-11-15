import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw,
  FileQuestion,
  Tag
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    category: 'Code Scan Issue',
    priority: 'Medium',
    subject: '',
    description: '',
    relatedCode: '',
    relatedRedemptionId: ''
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.support.getMyTickets();
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast.error('Subject and description are required.');
      return;
    }

    setCreatingTicket(true);
    try {
      const res = await api.support.createTicket(newTicket);
      if (res?.success) {
        toast.success('Support ticket created successfully!');
        setIsCreateModalOpen(false);
        setNewTicket({
          category: 'Code Scan Issue',
          priority: 'Medium',
          subject: '',
          description: '',
          relatedCode: '',
          relatedRedemptionId: ''
        });
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleOpenTicketThread = async (ticket) => {
    const tid = ticket._id || ticket.id;
    try {
      const res = await api.support.getTicketById(tid);
      if (res?.success && res.data?.ticket) {
        setSelectedTicket(res.data.ticket);
      } else {
        setSelectedTicket(ticket);
      }
    } catch (err) {
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
        message: replyMessage.trim()
      });
      if (res?.success && res.data?.ticket) {
        setSelectedTicket(res.data.ticket);
        setReplyMessage('');
        toast.success('Reply submitted');
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-black text-xs rounded border border-black">Open</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 bg-[#ffe17c] text-black font-black text-xs rounded border border-black shadow-[1px_1px_0px_0px_#000]">In Progress</span>;
      case 'Waiting for Customer':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-xs rounded border border-black">Waiting for You</span>;
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
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <HelpCircle className="w-3.5 h-3.5" />
            Customer Assistance & Dispute Resolution
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Support & Disputes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Encountered an issue with a box code, reward shipment, or point balance? Submit a dispute ticket to connect directly with our support specialists.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={fetchTickets}
            disabled={loading}
            className="p-3 bg-white text-black border-2 border-black rounded-xl neo-btn flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 bg-black text-[#ffe17c] border-2 border-black rounded-xl neo-btn flex items-center gap-2 font-black text-xs uppercase"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Ticket</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Category & Priority</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-500 space-y-2">
                    <FileQuestion className="w-10 h-10 mx-auto text-neutral-400" />
                    <p className="font-bold text-black text-sm">No support tickets found</p>
                    <p className="text-xs text-neutral-500">Need help? Open a new ticket anytime using the button above.</p>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const tid = t._id || t.id;
                  return (
                    <tr key={tid} className="hover:bg-[#fbfaf5] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-black">
                        #{tid?.substring(0, 8)}
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <span className="font-bold text-black block">{t.category}</span>
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-black">{t.subject}</p>
                        <p className="text-xs text-neutral-500 line-clamp-1">{t.description}</p>
                        {t.relatedCode && (
                          <span className="text-[10px] font-mono text-neutral-600 font-bold">
                            Code: {t.relatedCode}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 text-xs">
                        {new Date(t.updatedAt || t.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenTicketThread(t)}
                          className="px-3.5 py-1.5 bg-[#ffe17c] text-black border-2 border-black rounded-lg text-xs font-black neo-btn inline-flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>View Thread ({t.messages?.length || 1})</span>
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

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open a Support or Dispute Ticket"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-black mb-1">Category *</label>
              <select
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-bold"
              >
                <option value="Code Scan Issue">Code Scan Issue</option>
                <option value="Reward Delivery">Reward Delivery</option>
                <option value="Points Dispute">Points Dispute</option>
                <option value="Account Access">Account Access</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-black mb-1">Priority</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-black mb-1">Subject Summary *</label>
            <input
              type="text"
              required
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              placeholder="e.g., Code damaged / unreadable on tool kit"
              className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-1">Detailed Description *</label>
            <textarea
              rows="3"
              required
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Please explain the issue in detail, including serial digits, retail purchase location, etc."
              className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-black mb-1">Related Box Code (if any)</label>
              <input
                type="text"
                value={newTicket.relatedCode}
                onChange={(e) => setNewTicket({ ...newTicket, relatedCode: e.target.value.toUpperCase() })}
                placeholder="e.g., BOX-GOLD-8899"
                className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-mono font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-1">Redemption Order ID (if any)</label>
              <input
                type="text"
                value={newTicket.relatedRedemptionId}
                onChange={(e) => setNewTicket({ ...newTicket, relatedRedemptionId: e.target.value })}
                placeholder="e.g., 6789abc..."
                className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-mono font-medium"
              />
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-neutral-100 text-neutral-800 border-2 border-black rounded-xl font-bold neo-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingTicket}
              className="px-5 py-2 bg-[#ffe17c] text-black border-2 border-black rounded-xl font-black neo-btn"
            >
              {creatingTicket ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Thread & Reply Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Dispute Conversation Thread"
        maxWidth="max-w-2xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            
            {/* Ticket Header Card */}
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
              {selectedTicket.relatedCode && (
                <div className="pt-1 text-[11px] font-mono text-neutral-600">
                  Referenced Code: <strong>{selectedTicket.relatedCode}</strong>
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-600">
                Conversation History
              </h5>
              
              <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-neutral-50 border-2 border-black rounded-xl">
                {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                  <p className="text-xs text-neutral-500 italic text-center py-2">
                    No replies yet. Our support team will respond shortly.
                  </p>
                ) : (
                  selectedTicket.messages.map((m, idx) => {
                    const isAdmin = m.senderRole === 'Admin';
                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border-2 border-black max-w-[85%] text-xs space-y-1 ${
                          isAdmin 
                            ? 'bg-[#ffe17c] ml-auto neo-shadow-sm' 
                            : 'bg-white mr-auto neo-shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-4 text-[10px] font-black">
                          <span>{isAdmin ? '🛡️ LOYALTYBOX Support' : '👤 You'}</span>
                          <span className="text-neutral-600">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-black font-medium whitespace-pre-wrap">{m.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Reply Input Form */}
            {selectedTicket.status !== 'Closed' ? (
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message..."
                  className="flex-1 px-3 py-2 text-xs bg-white neo-input rounded-xl border-2 border-black font-medium text-black"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  className="px-4 py-2 bg-black text-[#ffe17c] border-2 border-black rounded-xl text-xs font-black neo-btn flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-neutral-500 text-center italic py-2">
                This ticket is closed. Please create a new ticket if you have further inquiries.
              </p>
            )}

          </div>
        )}
      </Modal>

    </div>
  );
}
