import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, MenuIcon, XIcon, HeartIcon, PlusIcon, MoonIcon, SunIcon, Edit3Icon, LogOutIcon, ChevronDownIcon } from 'lucide-react';
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside (but not on hover)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        // Add a small delay to prevent conflicts with hover events
        setTimeout(() => {
          setIsProfileDropdownOpen(false);
        }, 100);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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
            <button 
              onClick={() => isAuthenticated ? navigate('/wishlist') : navigate('/login')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative"
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </button>
            <button 
              onClick={() => isAuthenticated ? navigate('/cart') : navigate('/login')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {uniqueItems > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {uniqueItems}
                </span>}
            </button>
            <button 
              onClick={() => isAuthenticated ? navigate('/add-product') : navigate('/login')}
              className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            {isAuthenticated && <div 
              className="relative"
              ref={profileDropdownRef}
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <button 
                onClick={toggleProfileDropdown}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img src={user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80'} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                >
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit3Icon className="h-4 w-4 mr-3" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOutIcon className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>}
            {!isAuthenticated && <div className="flex space-x-2">
              <Link to="/login" className={`px-4 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white">
                Sign Up
              </Link>
            </div>}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => isAuthenticated ? navigate('/cart') : navigate('/login')}
              className="p-2 relative"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {uniqueItems > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {uniqueItems}
                </span>}
            </button>
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
              <button 
              onClick={() => isAuthenticated ? navigate('/wishlist') : navigate('/login')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} relative`}
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Wishlist
              {wishlistItems > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </button>
            </div>
            {isAuthenticated ? <>
                <button 
                  onClick={() => navigate('/profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <Edit3Icon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                <Link to="/listings" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  My Listings
                </Link>
                <Link to="/purchases" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  My Purchases
                </Link>
                <Link to="/add-product" className={`block px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                  Add Product
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                    setIsMenuOpen(false);
                  }} 
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-200'}`}
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Logout
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