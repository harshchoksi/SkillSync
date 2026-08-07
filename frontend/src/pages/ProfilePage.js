// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/common/ServiceCard';
import { StarDisplay } from '../components/common/StarRating';
import { ProfileSkeleton, Spinner } from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiEdit2, FiGithub, FiLinkedin, FiGlobe, FiStar, FiPackage, FiUser, FiSave, FiX } from 'react-icons/fi';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const navigate = useNavigate();
  const isOwn = me?._id === id;

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({});
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await userAPI.getProfile(id);
        setProfile(data.user);
        setServices(data.services);
        setReviews(data.reviews);
        setEditForm({
          name: data.user.name,
          bio: data.user.bio || '',
          skills: data.user.skills?.join(', ') || '',
          college: data.user.college || '',
          github: data.user.github || '',
          linkedin: data.user.linkedin || '',
          portfolio: data.user.portfolio || '',
          role: data.user.role,
        });
      } catch {
        toast.error('User not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => formData.append(k, v));
      if (newAvatar) formData.append('profileImage', newAvatar);

      const { data } = await userAPI.updateProfile(formData);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
      setNewAvatar(null);
      setAvatarPreview('');
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen py-10">
      <div className="section max-w-4xl"><ProfileSkeleton /></div>
    </div>
  );

  if (!profile) return null;

  const avatarUrl = avatarPreview || profile.profileImage || profile.avatar;

  return (
    <div className="min-h-screen py-10">
      <div className="section max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Sidebar Profile Card ── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="card p-6">
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brand-500/15 flex items-center justify-center ring-4 ring-brand-500/30">
                    <span className="text-brand-500 font-bold text-3xl">{profile.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                {editing && (
                  <label className="absolute inset-0 rounded-full bg-surface-900/60 flex items-center justify-center cursor-pointer hover:bg-surface-900/70 transition-colors">
                    <FiEdit2 size={20} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Name & role */}
              {editing ? (
                <div className="space-y-3 mb-4">
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input text-center" placeholder="Your name" />
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="input text-center text-sm">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <h1 className="text-xl font-display font-bold text-surface-900">{profile.name}</h1>
                  <span className={`mt-1 badge ${profile.role === 'seller' ? 'badge-blue' : 'badge-gray'}`}>
                    {profile.role}
                  </span>
                  {profile.college && <p className="text-surface-700 text-sm mt-2">{profile.college}</p>}
                </div>
              )}

              {/* Rating */}
              {profile.averageRating > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-surface-900/8">
                  <StarDisplay rating={profile.averageRating} size={14} />
                  <span className="text-amber-600 font-semibold text-sm">{profile.averageRating.toFixed(1)}</span>
                  <span className="text-surface-700 text-xs">({profile.totalReviews})</span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-surface-50 rounded-lg border border-surface-900/8">
                  <FiPackage size={18} className="text-brand-500 mx-auto mb-1" />
                  <p className="text-surface-900 font-bold">{services.length}</p>
                  <p className="text-surface-700 text-xs">Services</p>
                </div>
                <div className="text-center p-3 bg-surface-50 rounded-lg border border-surface-900/8">
                  <FiStar size={18} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-surface-900 font-bold">{profile.totalReviews || 0}</p>
                  <p className="text-surface-700 text-xs">Reviews</p>
                </div>
              </div>

              {/* Bio */}
              {editing ? (
                <div className="space-y-3">
                  <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="input resize-none text-sm" rows={3} placeholder="Tell buyers about yourself..." />
                  <input value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    className="input text-sm" placeholder="College / University" />
                  <input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                    className="input text-sm" placeholder="Skills (comma-separated)" />
                  <input value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                    className="input text-sm" placeholder="GitHub URL" />
                  <input value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                    className="input text-sm" placeholder="LinkedIn URL" />
                  <input value={editForm.portfolio} onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                    className="input text-sm" placeholder="Portfolio URL" />
                </div>
              ) : (
                <>
                  {profile.bio && <p className="text-surface-700 text-sm leading-relaxed mb-4">{profile.bio}</p>}
                  {profile.skills?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-surface-700 uppercase tracking-wide font-mono mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s) => (
                          <span key={s} className="tag-pill text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-surface-700 hover:text-brand-500 transition-colors">
                        <FiGithub size={14} /> GitHub
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-surface-700 hover:text-brand-500 transition-colors">
                        <FiLinkedin size={14} /> LinkedIn
                      </a>
                    )}
                    {profile.portfolio && (
                      <a href={profile.portfolio} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-surface-700 hover:text-brand-500 transition-colors">
                        <FiGlobe size={14} /> Portfolio
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* Edit / Save buttons (own profile only) */}
              {isOwn && (
                <div className="mt-5 pt-4 border-t border-surface-900/8">
                  {editing ? (
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center text-sm py-2">
                        {saving ? <Spinner size="sm" /> : <><FiSave size={13} /> Save</>}
                      </button>
                      <button onClick={() => { setEditing(false); setAvatarPreview(''); }} className="btn-secondary px-3 text-sm">
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} className="btn-secondary w-full justify-center text-sm py-2">
                      <FiEdit2 size={13} /> Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Chat button (for other users) */}
            {!isOwn && (
              <Link to={`/chat?with=${profile._id}`} className="btn-primary w-full justify-center">
                <FiUser size={15} /> Contact {profile.name?.split(' ')[0]}
              </Link>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-bold text-surface-900">
                  {isOwn ? 'My Services' : `${profile.name?.split(' ')[0]}'s Services`}
                </h2>
                {isOwn && profile.role === 'seller' && (
                  <Link to="/services/create" className="btn-primary text-sm">+ New Service</Link>
                )}
              </div>
              {services.length === 0 ? (
                <div className="card p-8 text-center text-surface-700">
                  <FiPackage size={28} className="mx-auto mb-2 opacity-30" />
                  <p>No services yet.</p>
                  {isOwn && profile.role === 'seller' && (
                    <Link to="/services/create" className="btn-primary inline-flex mt-4 text-sm">Create your first service</Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((s) => <ServiceCard key={s._id} service={s} />)}
                </div>
              )}
            </div>

            {/* Reviews received */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold text-surface-900 mb-5">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="card p-5">
                      <div className="flex items-start gap-3 mb-2">
                        {review.reviewer?.profileImage
                          ? <img src={review.reviewer.profileImage} alt={review.reviewer.name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-brand-500/20" />
                          : <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                              <span className="text-brand-500 font-semibold text-sm">{review.reviewer?.name?.[0]}</span>
                            </div>
                        }
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-surface-900 font-medium text-sm">{review.reviewer?.name}</span>
                            <span className="text-surface-700 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <StarDisplay rating={review.rating} size={12} />
                          {review.service && (
                            <Link to={`/services/${review.service._id}`} className="text-brand-500 text-xs hover:underline mt-0.5 block">
                              {review.service.title}
                            </Link>
                          )}
                        </div>
                      </div>
                      <p className="text-surface-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
