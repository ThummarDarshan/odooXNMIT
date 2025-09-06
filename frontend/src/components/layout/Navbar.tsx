import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, MenuIcon, XIcon, HeartIcon, PlusIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
const Navbar: React.FC = () => {
  const {
    user,
    logout,
    isAuthenticated
  } = useAuth();
  const {
    uniqueItems
  } = useCart();
  const {
    totalItems: wishlistItems
  } = useWishlist();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return <nav className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-green-600 text-2xl font-bold">Eco</span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Finds
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative">
              <HeartIcon className="h-5 w-5" />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative">
              <ShoppingCartIcon className="h-5 w-5" />
              {uniqueItems > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {uniqueItems}
                </span>}
            </Link>
            {isAuthenticated ? <div className="relative group">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img src={user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80'} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                </button>
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 hidden group-hover:block`}>
                  <Link to="/profile" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    Profile
                  </Link>
                  <Link to="/listings" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    My Listings
                  </Link>
                  <Link to="/purchases" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    My Purchases
                  </Link>
                  <Link to="/add-product" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    Add Product
                  </Link>
                  <button onClick={logout} className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}>
                    Sign Out
                  </button>
                </div>
              </div> : <div className="flex space-x-2">
                <Link to="/login" className={`px-4 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white">
                  Sign Up
                </Link>
              </div>}
            {isAuthenticated && <Link to="/add-product" className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white">
                <PlusIcon className="h-5 w-5" />
              </Link>}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="p-2 relative">
              <ShoppingCartIcon className="h-5 w-5" />
              {uniqueItems > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {uniqueItems}
                </span>}
            </Link>
            <button onClick={toggleMenu} className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`} aria-expanded={isMenuOpen}>
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && <div className={`md:hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="flex items-center justify-between px-3">
              <button onClick={toggleTheme} className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                {theme === 'dark' ? <>
                    <SunIcon className="h-5 w-5 mr-2" />
                    Light Mode
                  </> : <>
                    <MoonIcon className="h-5 w-5 mr-2" />
                    Dark Mode
                  </>}
              </button>
              <Link to="/wishlist" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} relative`}>
                <HeartIcon className="h-5 w-5 mr-2" />
                Wishlist
                {wishlistItems > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>
            </div>
            {isAuthenticated ? <>
                <Link to="/profile" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  Profile
                </Link>
                <Link to="/listings" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  My Listings
                </Link>
                <Link to="/purchases" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  My Purchases
                </Link>
                <Link to="/add-product" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  Add Product
                </Link>
                <button onClick={logout} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-200'}`}>
                  Sign Out
                </button>
              </> : <div className="px-3 py-2 space-y-2">
                <Link to="/login" className={`block w-full px-4 py-2 rounded-md text-center font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  Login
                </Link>
                <Link to="/signup" className="block w-full px-4 py-2 rounded-md text-center font-medium bg-green-600 hover:bg-green-700 text-white">
                  Sign Up
                </Link>
              </div>}
          </div>
        </div>}
    </nav>;
};
export default Navbar;