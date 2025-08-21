import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon,
  CalendarIcon,
  CogIcon,
  BanknotesIcon,
  SparklesIcon,
  FireIcon,
  DocumentChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const AdminNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: ChartBarIcon
    },
    {
      name: 'Business Management',
      href: '#',
      icon: BuildingOfficeIcon,
      children: [
        { name: 'Products', href: '/admin/products' },
        { name: 'Orders', href: '/admin/orders' },
        { name: 'Inventory', href: '/admin/inventory' },
        { name: 'Categories', href: '/admin/categories' },
        { name: 'Users', href: '/admin/users' }
      ]
    },
    {
      name: 'Finance & Profit',
      href: '/admin/finance',
      icon: BanknotesIcon
    },
    {
      name: 'Client Features',
      href: '/admin/client-features',
      icon: SparklesIcon
    },
    {
      name: 'Marketing',
      href: '#',
      icon: FireIcon,
      children: [
        { name: 'Campaigns', href: '/admin/events' },
        { name: 'Banners', href: '/admin/banners' },
        { name: 'Coupons', href: '/admin/coupons' }
      ]
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: DocumentChartBarIcon
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon
    }
  ];

  const isActive = (href) => {
    if (href === '#') return false;
    return location.pathname === href || location.pathname.startsWith(href);
  };

  const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.href));
  };

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Clothica</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      hasActiveChild(item)
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <ul className="mt-2 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            to={child.href}
                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActive(child.href)
                                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Orders Today:</span>
              <span className="font-medium text-gray-900">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium text-green-600">LKR 15,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Low Stock:</span>
              <span className="font-medium text-orange-600">8</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav; 