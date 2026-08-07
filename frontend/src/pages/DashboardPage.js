// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderAPI, serviceAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import { Spinner } from '../components/common/Loading';
import toast from 'react-hot-toast';
import {
  FiPackage, FiShoppingBag, FiGrid, FiStar, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit, FiTrash2, FiMessageCircle,
} from 'react-icons/fi';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     class: 'badge-orange', icon: FiClock },
  accepted:    { label: 'Accepted',    class: 'badge-blue',   icon: FiAlertCircle },
  in_progress: { label: 'In Progress', class: 'badge-blue',   icon: FiAlertCircle },
  completed:   { label: 'Completed',   class: 'badge-green',  icon: FiCheckCircle },
  cancelled:   { label: 'Cancelled',   class: 'badge-red',    icon: FiXCircle },
};

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ order, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (comment.length < 10) { toast.error('Comment must be at least 10 characters'); return; }
    setLoading(true);
    try {
      await reviewAPI.create({ orderId: order._id, rating, comment });
      toast.success('Review submitted! ⭐');
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card p-6 w-full max-w-md animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-display font-bold text-surface-900 mb-1">Leave a Review</h3>
        <p className="text-surface-700 text-sm mb-5">for <span className="text-surface-900 font-medium">{order.service?.title}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="label">Your Review</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
              placeholder="Share your experience working with this seller..." className="input resize-none" />
            <p className="text-xs text-surface-700 mt-1">{comment.length}/500 (min 10)</p>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Spinner size="sm" /> : 'Submit Review'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-4">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, viewAs, onStatusUpdate, onReview }) => {
  const { status, service, buyer, seller, price, createdAt, deadline, isReviewed } = order;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await orderAPI.updateStatus(order._id, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      onStatusUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const otherUser = viewAs === 'buyer' ? seller : buyer;
  const PLACEHOLDER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80';

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        {/* Service image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-surface-900/10">
          <img src={service?.serviceImage || PLACEHOLDER} alt={service?.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER; }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Link to={`/services/${service?._id}`} className="text-surface-900 font-semibold text-sm hover:text-brand-500 transition-colors line-clamp-1">
                {service?.title}
              </Link>
              <p className="text-surface-700 text-xs mt-0.5">
                {viewAs === 'buyer' ? `Seller: ${seller?.name}` : `Buyer: ${buyer?.name}`}
              </p>
            </div>
            <span className={`badge ${cfg.class} flex items-center gap-1 shrink-0`}>
              <StatusIcon size={11} /> {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-surface-900 font-bold">₹{price}</span>
            <span className="text-surface-700 text-xs">Ordered {new Date(createdAt).toLocaleDateString()}</span>
            {deadline && <span className="text-surface-700 text-xs">Due {new Date(deadline).toLocaleDateString()}</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Link to={`/chat?with=${otherUser?._id}`} className="btn-ghost text-xs px-3 py-1.5">
              <FiMessageCircle size={13} /> Chat
            </Link>

            {/* Seller actions */}
            {viewAs === 'seller' && (
              <>
                {status === 'pending' && (
                  <button onClick={() => updateStatus('accepted')} disabled={updating}
                    className="badge-green cursor-pointer hover:opacity-80 px-3 py-1">
                    {updating ? '...' : '✓ Accept'}
                  </button>
                )}
                {status === 'accepted' && (
                  <button onClick={() => updateStatus('in_progress')} disabled={updating}
                    className="badge-blue cursor-pointer hover:opacity-80 px-3 py-1">
                    {updating ? '...' : '▶ Start Work'}
                  </button>
                )}
                {status === 'in_progress' && (
                  <button onClick={() => updateStatus('completed')} disabled={updating}
                    className="badge-green cursor-pointer hover:opacity-80 px-3 py-1">
                    {updating ? '...' : '✓ Mark Complete'}
                  </button>
                )}
              </>
            )}

            {/* Buyer actions */}
            {viewAs === 'buyer' && status === 'completed' && !isReviewed && (
              <button onClick={() => onReview(order)}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors">
                <FiStar size={12} /> Leave Review
              </button>
            )}

            {/* Cancel */}
            {status === 'pending' && (
              <button onClick={() => updateStatus('cancelled')} disabled={updating}
                className="text-xs text-red-600 hover:text-red-700 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, isSeller } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';

  const [tab, setTab] = useState(defaultTab);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises = [orderAPI.getAll('buyer')];
      if (isSeller) {
        promises.push(orderAPI.getAll('seller'), serviceAPI.getMyServices());
      }
      const results = await Promise.all(promises);
      setBuyerOrders(results[0].data.orders);
      if (isSeller) {
        setSellerOrders(results[1].data.orders);
        setMyServices(results[2].data.services);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await serviceAPI.delete(serviceId);
      setMyServices(myServices.filter((s) => s._id !== serviceId));
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'orders', label: 'My Orders', icon: FiShoppingBag, count: buyerOrders.length },
    ...(isSeller ? [
      { id: 'requests', label: 'Incoming Orders', icon: FiPackage, count: sellerOrders.filter(o => o.status === 'pending').length },
      { id: 'services', label: 'My Services', icon: FiStar, count: myServices.length },
    ] : []),
  ];

  // Stats
  const completedBuyer = buyerOrders.filter(o => o.status === 'completed').length;
  const completedSeller = sellerOrders.filter(o => o.status === 'completed').length;
  const earnings = sellerOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);
  const pendingSeller = sellerOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen py-10">
      <div className="section">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-700 mt-1">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-200 rounded-lg mb-8 overflow-x-auto border border-surface-900/8">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                tab === id ? 'bg-brand-500 text-white shadow-sm' : 'text-surface-700 hover:text-surface-900'
              }`}>
              <Icon size={15} /> {label}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  tab === id ? 'bg-white/20 text-white' : 'bg-brand-500/15 text-brand-500'
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Orders Placed', value: buyerOrders.length, sub: `${completedBuyer} completed`, color: 'text-brand-500' },
                    ...(isSeller ? [
                      { label: 'Orders Received', value: sellerOrders.length, sub: `${pendingSeller} pending`, color: 'text-status-amber' },
                      { label: 'Total Earnings', value: `₹${earnings.toLocaleString()}`, sub: `${completedSeller} jobs done`, color: 'text-status-green' },
                      { label: 'Active Services', value: myServices.filter(s => s.isActive).length, sub: 'published', color: 'text-forest-500' },
                    ] : []),
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="card p-5">
                      <p className="text-surface-700 text-sm mb-1">{label}</p>
                      <p className={`text-2xl font-display font-bold ${color} mb-0.5`}>{value}</p>
                      <p className="text-xs text-surface-700">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                {buyerOrders.length > 0 && (
                  <div>
                    <h3 className="text-surface-900 font-display font-semibold mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {buyerOrders.slice(0, 3).map((o) => (
                        <OrderCard key={o._id} order={o} viewAs="buyer" onStatusUpdate={loadData} onReview={setReviewTarget} />
                      ))}
                    </div>
                    {buyerOrders.length > 3 && (
                      <button onClick={() => setTab('orders')} className="btn-ghost text-sm mt-3 text-brand-500">
                        View all {buyerOrders.length} orders →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── MY ORDERS (BUYER) TAB ── */}
            {tab === 'orders' && (
              <div>
                {buyerOrders.length === 0 ? (
                  <div className="card p-12 text-center">
                    <FiShoppingBag size={32} className="mx-auto mb-3 text-surface-700/30" />
                    <h3 className="text-surface-900 font-display font-semibold mb-1">No orders yet</h3>
                    <p className="text-surface-700 text-sm mb-5">Browse services and hire a talented student</p>
                    <Link to="/services" className="btn-primary">Browse Services</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {buyerOrders.map((o) => (
                      <OrderCard key={o._id} order={o} viewAs="buyer" onStatusUpdate={loadData} onReview={setReviewTarget} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── INCOMING ORDERS (SELLER) TAB ── */}
            {tab === 'requests' && isSeller && (
              <div>
                {sellerOrders.length === 0 ? (
                  <div className="card p-12 text-center">
                    <FiPackage size={32} className="mx-auto mb-3 text-surface-700/30" />
                    <h3 className="text-surface-900 font-display font-semibold mb-1">No orders received yet</h3>
                    <p className="text-surface-700 text-sm">Your orders will appear here when buyers hire you</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sellerOrders.map((o) => (
                      <OrderCard key={o._id} order={o} viewAs="seller" onStatusUpdate={loadData} onReview={() => {}} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MY SERVICES TAB ── */}
            {tab === 'services' && isSeller && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-surface-900 font-display font-semibold">Your Services ({myServices.length})</h3>
                  <Link to="/services/create" className="btn-primary text-sm">+ New Service</Link>
                </div>
                {myServices.length === 0 ? (
                  <div className="card p-12 text-center">
                    <FiStar size={32} className="mx-auto mb-3 text-surface-700/30" />
                    <h3 className="text-surface-900 font-display font-semibold mb-1">No services yet</h3>
                    <p className="text-surface-700 text-sm mb-5">Create your first service and start earning</p>
                    <Link to="/services/create" className="btn-primary">Create Service</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myServices.map((s) => (
                      <div key={s._id} className="card p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-surface-900/10">
                          <img src={s.serviceImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80'}
                            alt={s.title} className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/services/${s._id}`} className="text-surface-900 font-medium text-sm hover:text-brand-500 transition-colors line-clamp-1">
                            {s.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="tag-pill text-xs">{s.category}</span>
                            <span className="text-surface-900 text-xs font-medium">₹{s.price}</span>
                            <span className="text-surface-700 text-xs">{s.totalOrders} orders</span>
                            {!s.isActive && <span className="badge-red text-xs">Inactive</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/services/edit/${s._id}`} className="btn-ghost px-3 py-2 text-xs">
                            <FiEdit size={13} />
                          </Link>
                          <button onClick={() => handleDeleteService(s._id)} className="btn-ghost px-3 py-2 text-xs text-red-600 hover:text-red-700">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal order={reviewTarget} onClose={() => setReviewTarget(null)} onSubmitted={loadData} />
      )}
    </div>
  );
};

export default DashboardPage;
