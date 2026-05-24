// src/pages/CreateServicePage.js  (also handles editing when serviceId param present)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import { Spinner } from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
  'Data Science', 'Machine Learning', 'Content Writing', 'Video Editing',
  'Photography', 'Music & Audio', 'Digital Marketing', 'Tutoring', 'Translation', 'Other',
];

const CreateServicePage = () => {
  const { id } = useParams(); // present when editing
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: '', price: '', deliveryTime: '', tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingService, setFetchingService] = useState(isEditing);
  const [errors, setErrors] = useState({});

  // If editing, pre-fill form
  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      try {
        const { data } = await serviceAPI.getOne(id);
        const s = data.service;
        setForm({
          title: s.title,
          description: s.description,
          category: s.category,
          price: s.price,
          deliveryTime: s.deliveryTime,
          tags: s.tags?.join(', ') || '',
        });
        setImagePreview(s.serviceImage || '');
      } catch {
        toast.error('Failed to load service');
        navigate('/dashboard');
      } finally {
        setFetchingService(false);
      }
    };
    load();
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (form.description.length < 50) errs.description = 'Description must be at least 50 characters';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.price || form.price <= 0) errs.price = 'Enter a valid price';
    if (!form.deliveryTime || form.deliveryTime <= 0) errs.deliveryTime = 'Enter valid delivery time';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('serviceImage', imageFile);

    setLoading(true);
    try {
      if (isEditing) {
        await serviceAPI.update(id, formData);
        toast.success('Service updated! ✅');
        navigate(`/services/${id}`);
      } else {
        const { data } = await serviceAPI.create(formData);
        toast.success('Service created! 🎉');
        navigate(`/services/${data.service._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingService) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  );

  return (
    <div className="min-h-screen py-10">
      <div className="section max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{isEditing ? 'Edit Service' : 'Create New Service'}</h1>
          <p className="text-slate-400 mt-1">
            {isEditing ? 'Update your service details' : 'Share your skills with the student community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <div className="card p-6">
            <h2 className="text-white font-semibold mb-4">Service Image</h2>
            <label className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-colors overflow-hidden
              ${imagePreview ? 'border-brand-500/40' : 'border-white/15 hover:border-brand-500/40'}`}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium flex items-center gap-2"><FiUpload /> Change Image</span>
                  </div>
                </>
              ) : (
                <div className="py-14 flex flex-col items-center gap-3 text-slate-400">
                  <FiUpload size={28} className="text-brand-400" />
                  <div className="text-center">
                    <p className="font-medium text-slate-300">Click to upload image</p>
                    <p className="text-sm text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            {imagePreview && (
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="mt-2 flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300">
                <FiX size={13} /> Remove image
              </button>
            )}
          </div>

          {/* Basic details */}
          <div className="card p-6 space-y-5">
            <h2 className="text-white font-semibold">Service Details</h2>

            <div>
              <label className="label">Service Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. I will build a responsive React website"
                className={`input ${errors.title ? 'border-red-500/50' : ''}`} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              <p className="text-slate-500 text-xs mt-1">{form.title.length}/100</p>
            </div>

            <div>
              <label className="label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange}
                className={`input ${errors.category ? 'border-red-500/50' : ''}`}>
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={6}
                placeholder="Describe your service in detail. What will you deliver? What does the buyer get?"
                className={`input resize-none ${errors.description ? 'border-red-500/50' : ''}`} />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              <p className="text-slate-500 text-xs mt-1">{form.description.length}/2000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  placeholder="500" min="1"
                  className={`input ${errors.price ? 'border-red-500/50' : ''}`} />
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="label">Delivery Time (days) *</label>
                <input type="number" name="deliveryTime" value={form.deliveryTime} onChange={handleChange}
                  placeholder="3" min="1"
                  className={`input ${errors.deliveryTime ? 'border-red-500/50' : ''}`} />
                {errors.deliveryTime && <p className="text-red-400 text-xs mt-1">{errors.deliveryTime}</p>}
              </div>
            </div>

            <div>
              <label className="label">Tags (optional, comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="react, javascript, frontend, portfolio"
                className="input" />
              <p className="text-slate-500 text-xs mt-1">Help buyers find your service</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3">
              {loading ? <Spinner size="sm" /> : isEditing ? 'Save Changes' : 'Publish Service'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServicePage;
