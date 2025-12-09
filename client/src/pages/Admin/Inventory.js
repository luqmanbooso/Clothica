import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BellAlertIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CubeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const Inventory = () => {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const normalizeProduct = (p) => {
    if (!p) return null;
    const stock = p.inventory?.totalStock ?? p.stock ?? 0;
    return {
      ...p,
      _id: p._id || p.id,
      price: p.price ?? 0,
      stock,
      category: p.category || p.categoryName || 'Uncategorized',
    };
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/products');
      const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setProducts(list.map(normalizeProduct).filter(Boolean));
    } catch (err) {
      console.error('Error fetching products', err);
      showError('Failed to load products for inventory');
      setProducts([]);
    }
  }, [showError]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/inventory/alerts');
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching alerts', err);
      // keep alerts empty but don't block UI
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchAlerts()]);
      setLoading(false);
    };
    load();
  }, [fetchProducts, fetchAlerts]);

  const overview = useMemo(() => {
    const totalProducts = products.length;
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
    const criticalStock = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 2).length;
    const lowStock = products.filter((p) => (p.stock ?? 0) > 2 && (p.stock ?? 0) <= 5).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0);
    return { totalProducts, outOfStock, criticalStock, lowStock, totalValue };
  }, [products]);

  const getStockBadge = (stock) => {
    if (stock <= 0) return { label: 'Out of stock', color: 'bg-red-100 text-red-700' };
    if (stock <= 2) return { label: 'Critical', color: 'bg-orange-100 text-orange-700' };
    if (stock <= 5) return { label: 'Low', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Healthy', color: 'bg-green-100 text-green-700' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6C7A59]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Track product stock and alerts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C7A59] text-white hover:bg-[#5A6A4A] transition-colors"
          >
            <CubeIcon className="h-5 w-5" />
            Refresh Products
          </button>
          <button
            onClick={fetchAlerts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <BellAlertIcon className="h-5 w-5" />
            Refresh Alerts
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-1 shadow-sm border">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'stock', label: 'Stock', icon: CubeIcon },
            { id: 'alerts', label: 'Alerts', icon: BellAlertIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#6C7A59] text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#6C7A59]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{overview.totalProducts}</p>
              </div>
              <CubeIcon className="h-10 w-10 text-[#6C7A59]" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold text-gray-900">{overview.outOfStock}</p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low / Critical</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overview.lowStock + overview.criticalStock}
                </p>
              </div>
              <ExclamationCircleIcon className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{overview.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Product Stock</h2>
              <p className="text-sm text-gray-600">
                Showing {products.length} product{products.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const badge = getStockBadge(product.stock ?? 0);
                  return (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.description || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(product.price ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Inventory Alerts</h2>
              <p className="text-sm text-gray-600">
                {alerts.length === 0
                  ? 'No alerts at the moment'
                  : `${alerts.length} alert${alerts.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                All good — no alerts.
              </div>
            )}
            {alerts.map((alert, idx) => (
              <div key={idx} className="p-4 flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{alert.title || 'Inventory alert'}</p>
                  <p className="text-sm text-gray-700">{alert.message || alert.description || 'Check stock levels.'}</p>
                  {alert.productName && (
                    <p className="text-xs text-gray-500 mt-1">Product: {alert.productName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
