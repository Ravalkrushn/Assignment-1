import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Package, 
  Clock, 
  ArrowRight,
  Download,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function RewardFulfillmentPage() {
  const [redemptions, setRedemptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [shippingOrder, setShippingOrder] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    carrier: 'BlueDart Industrial Logistics',
    trackingNumber: '',
    expectedDeliveryDate: '',
    adminNotes: ''
  });

  const itemsPerPage = 8;

  const fetchRedemptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.redemptions.getAdmin({ limit: 100 });
      if (res?.success && Array.isArray(res?.data?.redemptions)) {
        setRedemptions(res.data.redemptions);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const filteredOrders = redemptions.filter(o => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (o.redemptionCode || '').toLowerCase().includes(sTerm) ||
      (o.customerName || '').toLowerCase().includes(sTerm) ||
      (o.userEmail || '').toLowerCase().includes(sTerm) ||
      (o.rewardName || '').toLowerCase().includes(sTerm);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (o.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginated = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    switch (s) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-black rounded text-[11px] font-black uppercase">Delivered</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-black rounded text-[11px] font-black uppercase">Shipped</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 border border-black rounded text-[11px] font-black uppercase">Processing</span>;
      case 'approved':
        return <span className="px-2.5 py-0.5 bg-[#ffe17c] text-black border border-black rounded text-[11px] font-black uppercase">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 bg-red-100 text-red-900 border border-black rounded text-[11px] font-black uppercase">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-black rounded text-[11px] font-black uppercase">Pending</span>;
    }
  };

  const handleUpdateStatus = async (id, nextStatus, payload = {}) => {
    try {
      const res = await api.redemptions.updateFulfillment(id, { status: nextStatus, ...payload });
      if (res?.success) {
        toast.success(`Fulfillment order updated to ${nextStatus}!`);
        fetchRedemptions();
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
      return false;
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please specify a valid rejection reason.');
      return;
    }

    const success = await handleUpdateStatus(rejectingOrder._id, 'Rejected', { rejectionReason });
    if (success) {
      setRejectingOrder(null);
      setRejectionReason('');
    }
  };

  const handleConfirmShip = async (e) => {
    e.preventDefault();
    if (!shippingForm.trackingNumber.trim()) {
      toast.error('Tracking number is required to dispatch shipments.');
      return;
    }

    const success = await handleUpdateStatus(shippingOrder._id, 'Shipped', {
      trackingNumber: shippingForm.trackingNumber,
      carrier: shippingForm.carrier,
      expectedDeliveryDate: shippingForm.expectedDeliveryDate,
      adminNotes: shippingForm.adminNotes
    });

    if (success) {
      setShippingOrder(null);
      setShippingForm({
        carrier: 'BlueDart Industrial Logistics',
        trackingNumber: '',
        expectedDeliveryDate: '',
        adminNotes: ''
      });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Truck className="w-3.5 h-3.5" />
            Factory Logistics & Delivery
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Reward Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Approve customer catalog claims, dispatch physical spare parts, allocate courier tracking numbers, and audit fulfillment lifecycle.
          </p>
        </div>
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
            placeholder="Search by order ID, customer name, email or reward..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-neutral-500">Status:</span>
          {['ALL', 'Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Rejected'].map((st) => (
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

      {/* Orders Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & Workshop</th>
                <th className="py-3 px-4">Reward Item</th>
                <th className="py-3 px-4">Points Spent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-medium">
                    No fulfillment orders match the selected filters.
                  </td>
                </tr>
              ) : (
                paginated.map((order) => {
                  const s = (order.status || 'Pending').toLowerCase();
                  return (
                    <tr key={order._id} className="hover:bg-[#fbfaf5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-black">{order.redemptionCode}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-black">{order.customerName}</p>
                        <p className="text-[11px] text-neutral-500">{order.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-black">{order.rewardName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded font-black text-xs">
                          {order.pointsSpent} PTS
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 text-xs font-bold bg-white neo-btn rounded-lg border-2 border-black"
                          title="View order details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {s === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Approved')}
                              className="px-2.5 py-1 text-xs font-bold bg-[#ffe17c] neo-btn rounded-lg border-2 border-black"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingOrder(order)}
                              className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-800 neo-btn rounded-lg border-2 border-black"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {s === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Processing')}
                            className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-900 neo-btn rounded-lg border-2 border-black"
                          >
                            Mark Processing
                          </button>
                        )}

                        {s === 'processing' && (
                          <button
                            onClick={() => {
                              setShippingOrder(order);
                              setShippingForm(prev => ({
                                ...prev,
                                trackingNumber: `BLU-${order.redemptionCode.replace('CLAIM-', '')}-${Math.floor(100 + Math.random() * 900)}`,
                                expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
                              }));
                            }}
                            className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-900 neo-btn rounded-lg border-2 border-black"
                          >
                            Ship Item
                          </button>
                        )}

                        {s === 'shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 neo-btn rounded-lg border-2 border-black"
                          >
                            Confirm Delivery
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Timeline Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details — ${selectedOrder.redemptionCode}`}
        >
          <div className="space-y-6">
            <div className="p-4 bg-[#fbfaf5] border-2 border-black rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-base text-black">{selectedOrder.rewardName}</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-neutral-500 font-bold block">Client Name:</span>
                  <span className="font-bold text-black">{selectedOrder.customerName} ({selectedOrder.userEmail})</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Points Cost:</span>
                  <span className="font-black text-black">{selectedOrder.pointsSpent} PTS</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 font-bold block">Delivery Address:</span>
                  <span className="font-medium text-black">{selectedOrder.deliveryAddress || 'Registered Workshop Facility'}</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <span className="text-neutral-500 font-bold block">Tracking Code:</span>
                    <span className="font-mono font-bold text-black">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder.carrier && (
                  <div>
                    <span className="text-neutral-500 font-bold block">Logistics Carrier:</span>
                    <span className="font-medium text-black">{selectedOrder.carrier}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-600">
                Fulfillment Timeline
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-black ml-2">
                {(selectedOrder.timeline && selectedOrder.timeline.length > 0
                  ? selectedOrder.timeline
                  : [{ status: selectedOrder.status, timestamp: selectedOrder.createdAt, note: 'Order registered' }]
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
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-black text-white neo-btn rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectingOrder && (
        <Modal
          isOpen={Boolean(rejectingOrder)}
          onClose={() => setRejectingOrder(null)}
          title={`Reject Fulfillment — ${rejectingOrder.redemptionCode}`}
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div className="p-3 bg-amber-50 border-2 border-black rounded-lg text-xs font-medium text-amber-900">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-700" />
              Rejecting this claim will automatically refund <strong>{rejectingOrder.pointsSpent} points</strong> back to the customer's wallet.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Out of stock at distributor, inaccurate delivery address, or suspicious purchase..."
                className="w-full p-3 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 bg-white text-black neo-btn rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 text-white neo-btn rounded-xl text-xs font-bold"
              >
                Confirm Rejection & Refund Points
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Shipping Modal */}
      {shippingOrder && (
        <Modal
          isOpen={Boolean(shippingOrder)}
          onClose={() => setShippingOrder(null)}
          title={`Dispatch Shipment — ${shippingOrder.redemptionCode}`}
        >
          <form onSubmit={handleConfirmShip} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Courier Carrier Name *
              </label>
              <input
                type="text"
                required
                value={shippingForm.carrier}
                onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                className="w-full p-2.5 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Waybill / Tracking Number *
              </label>
              <input
                type="text"
                required
                value={shippingForm.trackingNumber}
                onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
                className="w-full p-2.5 text-xs bg-white neo-input rounded-xl text-black font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={shippingForm.expectedDeliveryDate}
                onChange={(e) => setShippingForm({ ...shippingForm, expectedDeliveryDate: e.target.value })}
                className="w-full p-2.5 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShippingOrder(null)}
                className="px-4 py-2 bg-white text-black neo-btn rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white neo-btn rounded-xl text-xs font-bold"
              >
                Confirm Dispatch & Mark Shipped
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
