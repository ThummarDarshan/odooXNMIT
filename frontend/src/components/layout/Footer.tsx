import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
const Footer: React.FC = () => {
  const {
    theme
  } = useTheme();
  return <footer className={`${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-green-600 text-2xl font-bold">Eco</span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Finds
              </span>
            </Link>
            <p className="mt-2 text-sm">
              Sustainable second-hand marketplace for eco-conscious shoppers.
              Reducing waste, one purchase at a time.
            </p>
          </div>
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-green-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-green-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm hover:text-green-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-sm hover:text-green-500 transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-green-500 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/?category=furniture" className="text-sm hover:text-green-500 transition-colors">
                  Furniture
                </Link>
              </li>
              <li>
                <Link to="/?category=clothing" className="text-sm hover:text-green-500 transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/?category=electronics" className="text-sm hover:text-green-500 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/?category=home-decor" className="text-sm hover:text-green-500 transition-colors">
                  Home Decor
                </Link>
              </li>
              <li>
                <Link to="/?category=kitchen" className="text-sm hover:text-green-500 transition-colors">
                  Kitchen
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  123 Eco Street, Green City, 10001
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-sm">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <MailIcon className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-sm">info@ecofinds.com</span>
              </li>
            </ul>
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} EcoFinds. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link to="/privacy" className="text-sm hover:text-green-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm hover:text-green-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/faq" className="text-sm hover:text-green-500 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;