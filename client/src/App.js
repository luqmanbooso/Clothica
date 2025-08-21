import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import { CouponProvider } from './contexts/CouponContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AdminLayout from './components/Admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import About from './pages/About';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import Checkout from './pages/Checkout';
import LoyaltyDashboard from './pages/LoyaltyDashboard';
import ReviewsAndIssues from './pages/ReviewsAndIssues';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import OrdersAdmin from './pages/Admin/Orders';
import Users from './pages/Admin/Users';
import Categories from './pages/Admin/Categories';
import Coupons from './pages/Admin/Coupons';
import Banners from './pages/Admin/Banners';

import Analytics from './pages/Admin/Analytics';
import Settings from './pages/Admin/Settings';
import Events from './pages/Admin/Events';
import Finance from './pages/Admin/Finance';
import ClientFeatures from './pages/Admin/ClientFeatures';
import CampaignHub from './pages/Admin/CampaignHub';
import ComponentManagement from './pages/Admin/ComponentManagement';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import ClientRoute from './components/Auth/ClientRoute';

function App() {
  // Debug: Log the Google Client ID
  console.log('🔍 [DEBUG] Google Client ID loaded:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
  console.log('🔍 [DEBUG] All environment variables:', process.env);
  
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <LoyaltyProvider>
                  <CouponProvider>
                    <div className="App">
              <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={
                    <ClientRoute>
                      <Header />
                      <Home />
                      <Footer />
                    </ClientRoute>
                  } />
                  
                  <Route path="/shop" element={
                    <ClientRoute>
                      <Header />
                      <Shop />
                      <Footer />
                    </ClientRoute>
                  } />
                  
                  <Route path="/product/:id" element={
                    <ClientRoute>
                      <Header />
                      <ProductDetail />
                      <Footer />
                    </ClientRoute>
                  } />
                  
                  <Route path="/cart" element={
                    <ClientRoute>
                      <Header />
                      <Cart />
                      <Footer />
                    </ClientRoute>
                  } />
                  
                  <Route path="/checkout" element={
                    <ClientRoute>
                      <ProtectedRoute>
                        <Header />
                        <Checkout />
                        <Footer />
                      </ProtectedRoute>
                    </ClientRoute>
                  } />
                  
                  <Route path="/wishlist" element={
                    <ClientRoute>
                      <ProtectedRoute>
                        <Header />
                        <Wishlist />
                        <Footer />
                      </ProtectedRoute>
                    </ClientRoute>
                  } />
                  
                  <Route path="/login" element={
                    <ClientRoute>
                      <Login />
                    </ClientRoute>
                  } />
                  
                  <Route path="/register" element={
                    <ClientRoute>
                      <Register />
                    </ClientRoute>
                  } />
                  
                  <Route path="/forgot-password" element={
                    <ClientRoute>
                      <ForgotPassword />
                    </ClientRoute>
                  } />
                  
                  <Route path="/reset-password" element={
                    <ClientRoute>
                      <ResetPassword />
                    </ClientRoute>
                  } />
                  
                  <Route path="/contact" element={
                    <ClientRoute>
                      <Header />
                      <Contact />
                      <Footer />
                    </ClientRoute>
                  } />
                  
                  <Route path="/about" element={
                    <ClientRoute>
                      <Header />
                      <About />
                      <Footer />
                    </ClientRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ClientRoute>
                      <ProtectedRoute>
                        <Header />
                        <Profile />
                        <Footer />
                      </ProtectedRoute>
                    </ClientRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ClientRoute>
                      <ProtectedRoute>
                        <Header />
                        <Orders />
                        <Footer />
                      </ProtectedRoute>
                    </ClientRoute>
                  } />

                  <Route path="/order/:id" element={
                    <ClientRoute>
                      <ProtectedRoute>
                        <Header />
                        <OrderDetail />
                        <Footer />
                      </ProtectedRoute>
                    </ClientRoute>
                  } />

                  <Route path="/reviews-issues" element={
                    <ClientRoute>
                      <ProtectedRoute>
                        <Header />
                        <ReviewsAndIssues />
                        <Footer />
                      </ProtectedRoute>
                    </ClientRoute>
                  } />

                  <Route path="/order-success" element={
                    <ClientRoute>
                      <OrderSuccess />
                    </ClientRoute>
                  } />

                  <Route path="/loyalty" element={
                    <ProtectedRoute>
                      <Header />
                      <LoyaltyDashboard />
                      <Footer />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Dashboard />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/products" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Products />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <AdminLayout>
                        <OrdersAdmin />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Users />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/categories" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Categories />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  

                  
                  <Route path="/admin/analytics" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Analytics />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/settings" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Settings />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/events" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Events />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/finance" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Finance />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/client-features" element={
                    <AdminRoute>
                      <AdminLayout>
                        <ClientFeatures />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/coupons" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Coupons />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/banners" element={
                    <AdminRoute>
                      <AdminLayout>
                        <Banners />
                      </AdminLayout>
                    </AdminRoute>
                  } />

                  <Route path="/admin/campaign-hub" element={
                    <AdminRoute>
                      <AdminLayout>
                        <CampaignHub />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/component-management/:eventId" element={
                    <AdminRoute>
                      <AdminLayout>
                        <ComponentManagement />
                      </AdminLayout>
                    </AdminRoute>
                  } />
                </Routes>
                                                    </div>
                  </CouponProvider>
                </LoyaltyProvider>
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
        </ToastProvider>
    </GoogleOAuthProvider>
    );
  }

export default App; 