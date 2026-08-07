// src/pages/ServicesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import ServiceCard from '../components/common/ServiceCard';
import { ServiceCardSkeleton } from '../components/common/Loading';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₹500', min: '', max: '500' },
  { label: '₹500 – ₹2,000', min: '500', max: '2000' },
  { label: '₹2,000 – ₹5,000', min: '2000', max: '5000' },
  { label: 'Above ₹5,000', min: '5000', max: '' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    priceRange: 0,
    sort: '-createdAt',
  });

  useEffect(() => {
    serviceAPI.getCategories().then(({ data }) => setCategories(['All', ...data.categories]));
  }, []);

  const fetchServices = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    const range = PRICE_RANGES[filters.priceRange];
    const params = {
      page: currentPage,
      limit: 12,
      ...(filters.search && { search: filters.search }),
      ...(filters.category && filters.category !== 'All' && { category: filters.category }),
      ...(range.min && { minPrice: range.min }),
      ...(range.max && { maxPrice: range.max }),
      sort: filters.sort,
    };

    try {
      const { data } = await serviceAPI.getAll(params);
      setServices(data.services);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchServices(false); }, [page]); // eslint-disable-line
  useEffect(() => { fetchServices(true); }, [filters]); // eslint-disable-line

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices(true);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', priceRange: 0, sort: '-createdAt' });
    setSearchParams({});
  };

  const hasActiveFilters = filters.search || filters.category || filters.priceRange > 0;

  return (
    <div className="min-h-screen py-10">
      <div className="section">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-surface-900 mb-1">Browse Services</h1>
          <p className="text-surface-700">
            {total > 0 ? `${total} services available` : 'Discover student talent'}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-700" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-11 w-full"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-2 ${showFilters ? 'border-brand-500/40' : ''}`}>
            <FiFilter size={16} /> Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
          </button>
        </form>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-5 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="label">Category</label>
                <div className="relative">
                  <select value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="input appearance-none pr-8">
                    {categories.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="label">Price Range</label>
                <div className="relative">
                  <select value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: Number(e.target.value) })}
                    className="input appearance-none pr-8">
                    {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="label">Sort By</label>
                <div className="relative">
                  <select value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="input appearance-none pr-8">
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-surface-700 hover:text-brand-500 mt-4 transition-colors">
                <FiX size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {['All', 'Web Development', 'UI/UX Design', 'Data Science', 'Content Writing', 'Tutoring', 'Video Editing'].map((cat) => (
            <button key={cat}
              onClick={() => setFilters({ ...filters, category: cat === 'All' ? '' : cat })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                (cat === 'All' && !filters.category) || filters.category === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-200 text-surface-700 hover:text-surface-900 border border-surface-900/10'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-semibold text-surface-900 mb-2">No services found</h3>
            <p className="text-surface-700 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services.map((s) => <ServiceCard key={s._id} service={s} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}
                  className="btn-secondary text-sm disabled:opacity-40">Previous</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-brand-500 text-white' : 'bg-surface-200 text-surface-700 hover:text-surface-900 border border-surface-900/10'
                    }`}>{p}</button>
                ))}
                <button onClick={() => setPage(page + 1)} disabled={page === pages}
                  className="btn-secondary text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
