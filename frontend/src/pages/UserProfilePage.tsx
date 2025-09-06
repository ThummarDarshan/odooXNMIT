import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { User, ShoppingBag, Package, Heart, Edit3, Camera, CalendarIcon, EyeIcon, PencilIcon, TrashIcon, XIcon, SaveIcon } from 'lucide-react';
import { usersApi, purchasesApi, getFullImageUrl } from '../lib/api';

const UserProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { listings, deleteListing } = useListings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'listings'>('overview');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    profileImage: ''
  });

  const [stats, setStats] = useState<{ totalPurchases: number; totalListings: number; wishlistItems: number; rating: number }>({ totalPurchases: 0, totalListings: 0, wishlistItems: 0, rating: 4.8 });
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await usersApi.stats();
        const s = res.stats;
        setStats({
          totalPurchases: s.purchases?.totalOrders ?? 0,
          totalListings: s.products?.total ?? listings.length,
          wishlistItems: s.wishlist?.totalItems ?? 0,
          rating: 4.8
        });
      } catch (_) {
        setStats(prev => ({ ...prev, totalListings: listings.length }));
      }
    })();
  }, [listings.length]);

  const fetchPurchases = async () => {
    setIsLoadingPurchases(true);
    try {
      const res = await purchasesApi.history();
      // Flatten the orders to get individual purchase items
      const flatPurchases = res.orders.flatMap((order: any) => 
        order.items.map((item: any) => ({
          id: `${order.id}_${item.id}`,
          product: {
            id: item.product.id,
            title: item.product.title,
            imageUrl: item.product.imageUrl,
            category: item.product.category,
            condition: item.product.condition,
            price: item.priceAtPurchase,
            seller: item.product.seller
          },
          purchaseDate: order.createdAt,
          quantity: item.quantity,
          price: item.priceAtPurchase,
        }))
      );
      setPurchases(flatPurchases);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      setPurchases([]);
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchases();
    }
  }, [activeTab]);

  // Use actual user data from auth context, with fallback for demo
  const userData = user ? {
    id: user.id,
    name: user.displayName,
    email: user.email,
    joinDate: 'January 2024',
    profileImage: user.profileImage,
    stats: {
      totalPurchases: stats.totalPurchases,
      totalListings: stats.totalListings,
      wishlistItems: stats.wishlistItems,
      rating: stats.rating
    }
  } : {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2024',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    stats: {
      totalPurchases: 12,
      totalListings: listings.length,
      wishlistItems: 15,
      rating: 4.8
    }
  };

  const handleEditProfile = () => {
    setFormData({
      displayName: userData.name,
      email: userData.email,
      profileImage: userData.profileImage
    });
    setImagePreview(userData.profileImage);
    setImageFile(null);
    setEditModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, profileImage: imageUrl }));
        
        // Update the main profile image immediately
        setUserData(prev => ({ ...prev, profileImage: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload({ target: { files: [file] } } as any);
      } else {
        alert('Please drop a valid image file');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      displayName: formData.displayName,
      email: formData.email,
      profileImage: formData.profileImage
    });
    if (imageFile) {
      try {
        await usersApi.uploadProfileImage(imageFile);
      } catch (e) {
        console.error('Profile image upload failed', e);
      }
    }
    setEditModalOpen(false);
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setImagePreview('');
    setImageFile(null);
    setFormData({
      displayName: '',
      email: '',
      profileImage: ''
    });
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden`}>
          <div className={`h-32 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' : 'bg-white'}`}></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16">
              <div className="relative">
                <img
                  src={userData.profileImage}
                  alt={userData.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                />
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
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300`}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchases</p>
                <p className="text-2xl font-bold">{userData.stats.totalPurchases}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300`}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Listings</p>
                <p className="text-2xl font-bold">{userData.stats.totalListings}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300`}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900 rounded-full">
                <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wishlist</p>
                <p className="text-2xl font-bold">{userData.stats.wishlistItems}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300`}>
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900 rounded-full">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold">{userData.stats.rating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700 mb-8`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-gray-600 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'purchases'
                    ? 'border-gray-600 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'listings'
                    ? 'border-gray-600 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Listings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700 p-6`}>
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
                  </div>
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
              {isLoadingPurchases ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.slice(0, 3).map((purchase) => (
                    <div key={purchase.id} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="flex-shrink-0 mb-4 md:mb-0">
                          <img 
                            src={getFullImageUrl(purchase.product.imageUrl)} 
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
                                  className="hover:text-gray-700 dark:hover:text-gray-300"
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
                              <p className="text-lg font-medium text-gray-900 dark:text-white">
                                ₹{purchase.price.toFixed(2)}
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
                            src={getFullImageUrl(listing.imageUrl)} 
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
                                  className="hover:text-gray-700 dark:hover:text-gray-300"
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
                              <p className="text-lg font-medium text-gray-900 dark:text-white">
                                ₹{listing.price.toFixed(2)}
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

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              onClick={handleCancelEdit}
            ></div>
            <div className={`relative rounded-lg max-w-2xl w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">Edit Profile</h3>
                <button
                  onClick={handleCancelEdit}
                  className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={imagePreview || formData.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Profile Picture</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Click camera icon to upload image</p>
                    </div>
                  </div>

                  {/* Upload Options */}
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Image
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                          theme === 'dark' 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' 
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Camera className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Current Image Info */}
                    {imageFile && (
                      <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✓ New image selected: {imageFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveProfile} className="flex items-center">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
