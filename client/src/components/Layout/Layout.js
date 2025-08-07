import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';

const Layout = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { wishlist } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        cartCount={getCartCount()}
        wishlistCount={wishlist.length}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
      />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout; 