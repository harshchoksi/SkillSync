// src/pages/ServiceDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviceAPI, orderAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/common/StarRating';
import { Spinner } from '../components/common/Loading';
import toast from 'react-hot-toast';
import {
  FiClock, FiStar, FiUser, FiEdit, FiTrash2, FiMessageCircle,
  FiShoppingCart, FiCheckCircle, FiExternalLink,
} from 'react-icons/fi';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?._id === service?.seller?._id;

  useEffect(() => {
    const load = async () => {
      try {
        const [svcRes, revRes] = await Promise.all([
          serviceAPI.getOne(id),
          reviewAPI.getForService(id, { limit: 10 }),
        ]);
        setService(svcRes.data.service);
        setReviews(revRes.data.reviews);
      } catch {
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setOrdering(true);
    try {
      await orderAPI.create({ serviceId: id, requirements });
      toast.success('Order placed successfully! 🎉');
      navigate('/dashboard?tab=orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this service? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await serviceAPI.delete(id);
      toast.success('Service deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!service) return null;

  const { title, description, category, price, deliveryTime, serviceImage, averageRating, totalReviews, seller, tags } = service;

  return (
    <div className="min-h-screen py-10">
      <div className="section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Service Info ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-surface-700">
              <Link to="/services" className="hover:text-brand-500 transition-colors">Services</Link>
              <span>/</span>
              <span>{category}</span>
              <span>/</span>
              <span className="text-surface-900 line-clamp-1 max-w-xs">{title}</span>
            </div>

            {/* Title & badge */}
            <div>
              <span className="tag-pill mb-3">{category}</span>
              <h1 className="text-3xl font-display font-bold text-surface-900 mt-2 leading-tight">{title}</h1>
            </div>

            {/* Rating + seller */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <StarDisplay rating={averageRating} size={16} />
                <span className="text-amber-600 font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
                <span className="text-surface-700 text-sm">({totalReviews} reviews)</span>
              </div>
              <span className="text-surface-700/30">|</span>
              <div className="flex items-center gap-2">
                {seller?.profileImage
                  ? <img src={seller.profileImage} alt={seller.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-brand-500/30" />
                  : <div className="w-6 h-6 rounded-full bg-brand-500/15 flex items-center justify-center">
                      <FiUser size={12} className="text-brand-500" />
                    </div>
                }
                <Link to={`/profile/${seller?._id}`} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
                  {seller?.name}
                </Link>
                {seller?.college && <span className="text-surface-700 text-xs">• {seller.college}</span>}
              </div>
            </div>

            {/* Service image */}
            <div className="rounded-lg overflow-hidden aspect-video border border-surface-900/10">
              <img src={serviceImage || PLACEHOLDER_IMG} alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 mb-3">About this service</h2>
              <p className="text-surface-700 leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Tags */}
            {tags?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-pill">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-3">
                <Link to={`/services/edit/${id}`} className="btn-secondary gap-2">
                  <FiEdit size={15} /> Edit Service
                </Link>
                <button onClick={handleDelete} disabled={deleting} className="btn-danger gap-2">
                  {deleting ? <Spinner size="sm" /> : <FiTrash2 size={15} />} Delete
                </button>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-display font-bold text-surface-900 mb-5">
                Reviews {totalReviews > 0 && <span className="text-surface-700 font-normal text-base">({totalReviews})</span>}
              </h2>
              {reviews.length === 0 ? (
                <div className="card p-8 text-center text-surface-700">
                  <FiStar size={28} className="mx-auto mb-2 opacity-30" />
                  <p>No reviews yet. Be the first to order and review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="card p-5">
                      <div className="flex items-start gap-3 mb-3">
                        {review.reviewer?.profileImage
                          ? <img src={review.reviewer.profileImage} alt={review.reviewer.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-brand-500/20" />
                          : <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                              <span className="text-brand-500 font-semibold text-sm">{review.reviewer?.name?.[0]}</span>
                            </div>
                        }
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-surface-900 font-medium text-sm">{review.reviewer?.name}</span>
                            <span className="text-surface-700 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <StarDisplay rating={review.rating} size={13} />
                        </div>
                      </div>
                      <p className="text-surface-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Card (sticky) ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {/* Price */}
              <div className="mb-5">
                <p className="text-surface-700 text-sm mb-1">Starting at</p>
                <p className="text-4xl font-display font-bold text-surface-900">₹{price}</p>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2 text-surface-700 mb-6 pb-5 border-b border-surface-900/8">
                <FiClock size={16} className="text-brand-500" />
                <span className="text-sm">{deliveryTime} day{deliveryTime > 1 ? 's' : ''} delivery</span>
              </div>

              {/* What's included */}
              <div className="space-y-2 mb-6">
                {['Detailed description on completion', 'Source files included', 'Revisions available', 'Direct communication'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-surface-700">
                    <FiCheckCircle size={14} className="text-status-green shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              {isOwner ? (
                <div className="space-y-3">
                  <Link to={`/services/edit/${id}`} className="btn-secondary w-full justify-center">
                    <FiEdit size={15} /> Edit Service
                  </Link>
                  <Link to={`/profile/${user._id}`} className="btn-ghost w-full justify-center text-sm">
                    <FiExternalLink size={14} /> View My Profile
                  </Link>
                </div>
              ) : !isAuthenticated ? (
                <Link to="/login" className="btn-primary w-full justify-center">
                  Sign in to Order
                </Link>
              ) : (
                <>
                  {!showOrderForm ? (
                    <div className="space-y-3">
                      <button onClick={() => setShowOrderForm(true)} className="btn-primary w-full justify-center">
                        <FiShoppingCart size={16} /> Order Now
                      </button>
                      <Link to={`/chat?with=${seller?._id}`} className="btn-secondary w-full justify-center text-sm">
                        <FiMessageCircle size={15} /> Contact Seller
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleOrder} className="space-y-4">
                      <div>
                        <label className="label">Your Requirements</label>
                        <textarea
                          value={requirements}
                          onChange={(e) => setRequirements(e.target.value)}
                          placeholder="Describe what you need, any specific details..."
                          rows={4}
                          className="input resize-none"
                        />
                      </div>
                      <button type="submit" disabled={ordering} className="btn-primary w-full justify-center">
                        {ordering ? <Spinner size="sm" /> : `Confirm Order • ₹${price}`}
                      </button>
                      <button type="button" onClick={() => setShowOrderForm(false)} className="btn-ghost w-full justify-center text-sm">
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Seller mini profile */}
              <div className="mt-6 pt-5 border-t border-surface-900/8">
                <p className="text-xs text-surface-700 uppercase tracking-wide font-mono mb-3">About the Seller</p>
                <div className="flex items-center gap-3 mb-3">
                  {seller?.profileImage
                    ? <img src={seller.profileImage} alt={seller.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/30" />
                    : <div className="w-11 h-11 rounded-full bg-brand-500/15 flex items-center justify-center">
                        <span className="text-brand-500 font-bold">{seller?.name?.[0]}</span>
                      </div>
                  }
                  <div>
                    <Link to={`/profile/${seller?._id}`} className="text-surface-900 font-medium text-sm hover:text-brand-500 transition-colors">
                      {seller?.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FiStar size={11} className="text-amber-500 fill-amber-500" />
                      <span className="text-amber-600 text-xs font-medium">{seller?.averageRating?.toFixed(1) || 'New'}</span>
                    </div>
                  </div>
                </div>
                {seller?.bio && (
                  <p className="text-surface-700 text-xs leading-relaxed line-clamp-2">{seller.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
