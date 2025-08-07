import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-display font-bold">Clothica</span>
            </div>
            <p className="text-secondary-300 text-sm leading-relaxed">
              Your premier destination for fashion-forward clothing. Discover the latest trends, 
              quality materials, and exceptional style for every occasion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=men" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Men's Clothing
                </Link>
              </li>
              <li>
                <Link to="/shop?category=women" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Women's Clothing
                </Link>
              </li>
              <li>
                <Link to="/shop?category=kids" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Kids' Clothing
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shoes" className="text-secondary-300 hover:text-white transition-colors text-sm">
                  Shoes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-primary-400 w-4 h-4" />
                <span className="text-secondary-300 text-sm">
                  123 Fashion Street, Style City, SC 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-primary-400 w-4 h-4" />
                <span className="text-secondary-300 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-primary-400 w-4 h-4" />
                <span className="text-secondary-300 text-sm">
                  hello@clothica.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-secondary-400 text-sm">
              © 2024 Clothica. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-secondary-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-secondary-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/shipping" className="text-secondary-400 hover:text-white transition-colors text-sm">
                Shipping Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 