import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

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
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

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

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <Header />
                    <Home />
                    <Footer />
                  </>
                } />
                
                <Route path="/shop" element={
                  <>
                    <Header />
                    <Shop />
                    <Footer />
                  </>
                } />
                
                <Route path="/product/:id" element={
                  <>
                    <Header />
                    <ProductDetail />
                    <Footer />
                  </>
                } />
                
                <Route path="/cart" element={
                  <>
                    <Header />
                    <Cart />
                    <Footer />
                  </>
                } />
                
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Header />
                    <Wishlist />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/login" element={
                  <>
                    <Login />
                  </>
                } />
                
                <Route path="/register" element={
                  <>
                    <Register />
                  </>
                } />
                
                <Route path="/contact" element={
                  <>
                    <Header />
                    <Contact />
                    <Footer />
                  </>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Header />
                    <Profile />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Header />
                    <Orders />
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
              </Routes>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    );
  }

export default App; 