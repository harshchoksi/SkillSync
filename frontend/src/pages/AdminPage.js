// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { userAPI, orderAPI, serviceAPI } from '../services/api';
import { Spinner } from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiUsers, FiPackage, FiShoppingBag, FiTrash2, FiShield } from 'react-icons/fi';

const AdminPage = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, ordersRes, servicesRes] = await Promise.all([
        userAPI.getAllUsers(),
        orderAPI.adminGetAll(),
        serviceAPI.getAll({ limit: 1000 }),
      ]);
      setUsers(usersRes.data.users);
      setOrders(ordersRes.data.orders);
      setServices(servicesRes.data.services);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await userAPI.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    setDeleting(id);
    try {
      await serviceAPI.delete(id);
      toast.success('Service deleted');
      loadData();
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  const stats = {
    totalUsers: users.length,
    sellers: users.filter((u) => u.role === 'seller').length,
    buyers: users.filter((u) => u.role === 'buyer').length,
    totalOrders: orders.length,
    revenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.price, 0),
    totalServices: services.length,
  };

  const ROLE_BADGE = {
    admin: 'badge-red',
    seller: 'badge-blue',
    buyer: 'badge-gray',
  };

  const STATUS_BADGE = {
    pending: 'badge-orange',
    accepted: 'badge-blue',
    in_progress: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };

  return (
    <div className="min-h-screen py-10">
      <div className="section">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <FiShield className="text-red-400" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Platform overview and management</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-brand-400' },
            { label: 'Sellers', value: stats.sellers, icon: FiUsers, color: 'text-purple-400' },
            { label: 'Total Services', value: stats.totalServices, icon: FiPackage, color: 'text-emerald-400' },
            { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingBag, color: 'text-orange-400' },
            { label: 'Platform Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: FiShoppingBag, color: 'text-green-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <Icon size={18} className={`${color} mb-2`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-800 rounded-xl mb-6 w-fit">
          {[
            { id: 'users', label: 'Users', icon: FiUsers },
            { id: 'services', label: 'Services', icon: FiPackage },
            { id: 'orders', label: 'Orders', icon: FiShoppingBag },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Users Table */}
            {tab === 'users' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {u.profileImage ? (
                                <img src={u.profileImage} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                                  <span className="text-brand-400 font-semibold text-sm">{u.name?.[0]}</span>
                                </div>
                              )}
                              <span className="text-white text-sm font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-sm">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-sm">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            {u.role !== 'admin' && (
                              <button onClick={() => deleteUser(u._id, u.name)} disabled={deleting === u._id}
                                className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                                {deleting === u._id ? <Spinner size="sm" /> : <FiTrash2 size={14} />}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Services Table */}
            {tab === 'services' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['Title', 'Category', 'Seller', 'Price', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-white text-sm font-medium line-clamp-1 max-w-xs">{s.title}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-sm">{s.category}</td>
                          <td className="px-5 py-4 text-slate-300 text-sm">{s.seller?.name}</td>
                          <td className="px-5 py-4 text-white font-semibold text-sm">₹{s.price}</td>
                          <td className="px-5 py-4">
                            <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td className="px-5 py-4">
                            {s.isActive && (
                              <button onClick={() => deleteService(s._id)} disabled={deleting === s._id}
                                title="Delete Service"
                                className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                                {deleting === s._id ? <Spinner size="sm" /> : <FiTrash2 size={14} />}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {services.length === 0 && (
                    <div className="py-12 text-center text-slate-400">No services found</div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Table */}
            {tab === 'orders' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['Service', 'Buyer', 'Seller', 'Amount', 'Status', 'Date'].map((h) => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-white text-sm font-medium line-clamp-1 max-w-xs">{o.service?.title}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-300 text-sm">{o.buyer?.name}</td>
                          <td className="px-5 py-4 text-slate-300 text-sm">{o.seller?.name}</td>
                          <td className="px-5 py-4 text-white font-semibold text-sm">₹{o.price}</td>
                          <td className="px-5 py-4">
                            <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-sm">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="py-12 text-center text-slate-400">No orders found</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
