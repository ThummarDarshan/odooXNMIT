import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import Button from '../components/ui/Button';
import { User, ShoppingBag, Package, Heart, Settings, Edit3, Camera, CalendarIcon, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { purchases } from '../data/dummyData';

const UserProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { listings, deleteListing } = useListings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'listings'>('overview');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  // Mock user data - in a real app, this would come from the auth context or API
  const userData = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    joinDate: 'January 2024',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    bio: 'Eco-conscious shopper passionate about sustainable living and reducing waste.',
    stats: {
      totalPurchases: 12,
      totalListings: listings.length,
      wishlistItems: 15,
      rating: 4.8
    }
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page or open modal
    console.log('Edit profile clicked');
  };

  const handleChangePhoto = () => {
    // Handle photo change
    console.log('Change photo clicked');
  };

  const handleDeleteClick = (id: string) => {
    setSelectedListing(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedListing) {
      deleteListing(selectedListing);
      console.log('Listing deleted:', selectedListing);
    }
    setDeleteModalOpen(false);
    setSelectedListing(null);
  };

  const handleEditClick = (id: string) => {
    navigate(`/edit-product/${id}`);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden mb-8`}>
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16">
              <div className="relative">
                <img
                  src={userData.profileImage}
                  alt={userData.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                />
                <button
                  onClick={handleChangePhoto}
                  className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="sm:ml-6 mt-4 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{userData.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{userData.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Member since {userData.joinDate}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <Button variant="outline" onClick={handleEditProfile} className="flex items-center">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchases</p>
                <p className="text-2xl font-bold">{userData.stats.totalPurchases}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Listings</p>
                <p className="text-2xl font-bold">{userData.stats.totalListings}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wishlist</p>
                <p className="text-2xl font-bold">{userData.stats.wishlistItems}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold">{userData.stats.rating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md mb-8`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'purchases'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'listings'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Listings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                      <p className="text-gray-900 dark:text-white">{userData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{userData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{userData.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                      <p className="text-gray-900 dark:text-white">{userData.location}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Bio</h3>
                  <p className="text-gray-700 dark:text-gray-300">{userData.bio}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Purchases</h2>
                <Button variant="primary" onClick={() => navigate('/purchases')}>
                  View All Purchases
                </Button>
              </div>
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.slice(0, 3).map((purchase) => (
                    <div key={purchase.id} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="flex-shrink-0 mb-4 md:mb-0">
                          <img 
                            src={purchase.product.imageUrl} 
                            alt={purchase.product.title} 
                            className="w-full md:w-24 h-24 rounded-md object-cover" 
                          />
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 md:ml-4">
                          <div className="flex flex-col md:flex-row md:justify-between">
                            <div>
                              <h3 className="text-lg font-medium">
                                <Link 
                                  to={`/product/${purchase.product.id}`} 
                                  className="hover:text-green-600 dark:hover:text-green-400"
                                >
                                  {purchase.product.title}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {purchase.product.category} • {purchase.product.condition}
                              </p>
                              <p className="mt-1 text-sm">
                                Sold by {purchase.product.seller.name}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 md:text-right">
                              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                                ${purchase.product.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Quantity: {purchase.quantity}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 md:justify-end">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>
                                  Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link to={`/product/${purchase.product.id}`}>
                              <Button variant="outline" size="sm">
                                View Product
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              Leave Review
                            </Button>
                            <Button variant="outline" size="sm">
                              Buy Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {purchases.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => navigate('/purchases')}>
                        View All {purchases.length} Purchases
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start shopping to see your purchase history here.
                  </p>
                  <Button variant="primary" onClick={() => navigate('/')}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Listings</h2>
                <Button variant="primary" onClick={() => navigate('/add-product')}>
                  Add New Listing
                </Button>
              </div>
              {listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="flex-shrink-0 mb-4 md:mb-0">
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.title} 
                            className="w-full md:w-24 h-24 rounded-md object-cover" 
                          />
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 md:ml-4">
                          <div className="flex flex-col md:flex-row md:justify-between">
                            <div>
                              <h3 className="text-lg font-medium">
                                <Link 
                                  to={`/product/${listing.id}`} 
                                  className="hover:text-green-600 dark:hover:text-green-400"
                                >
                                  {listing.title}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {listing.category} • {listing.condition}
                              </p>
                              <p className="mt-1 text-sm line-clamp-2">
                                {listing.description}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 md:text-right">
                              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                                ${listing.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Quantity: {listing.quantity}
                              </p>
                              {listing.isEcoFriendly && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Eco-Friendly
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link to={`/product/${listing.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => handleEditClick(listing.id)}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                              onClick={() => handleDeleteClick(listing.id)}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {listings.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => navigate('/listings')}>
                        View All {listings.length} Listings
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start selling your items to see your listings here.
                  </p>
                  <Button variant="primary" onClick={() => navigate('/add-product')}>
                    Create First Listing
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              onClick={() => setDeleteModalOpen(false)}
            ></div>
            <div className={`relative rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl p-6`}>
              <h3 className="text-lg font-medium mb-4">Delete Listing</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this listing? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
