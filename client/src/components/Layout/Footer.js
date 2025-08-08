import React from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-[#1E1E1E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-display font-bold">Clothica</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your premier destination for fashion-forward clothing. Discover the latest trends, 
              quality materials, and exceptional style for every occasion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <GlobeAltIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <GlobeAltIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <GlobeAltIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=mens" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link to="/shop?category=womens" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=footwear" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Footwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="text-[#6C7A59] w-4 h-4" />
                <span className="text-gray-300 text-sm">
                  123 Fashion Street, Style City, SC 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="text-[#6C7A59] w-4 h-4" />
                <span className="text-gray-300 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="text-[#6C7A59] w-4 h-4" />
                <span className="text-gray-300 text-sm">
                  hello@clothica.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Clothica. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 