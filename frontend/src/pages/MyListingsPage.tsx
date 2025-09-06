import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { myListings } from '../data/dummyData';
import Button from '../components/ui/Button';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, FilterIcon, SlidersIcon } from 'lucide-react';
import Select from '../components/ui/Select';
const MyListingsPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    isAuthenticated
  } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const categories = ['All Categories', ...Array.from(new Set(myListings.map(p => p.category)))];
  const sortOptions = [{
    value: 'newest',
    label: 'Newest First'
  }, {
    value: 'oldest',
    label: 'Oldest First'
  }, {
    value: 'price-low',
    label: 'Price: Low to High'
  }, {
    value: 'price-high',
    label: 'Price: High to Low'
  }];
  // Filter and sort listings
  const filteredListings = myListings.filter(listing => categoryFilter === 'All Categories' || listing.category === categoryFilter).sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      // In a real app, we'd sort by date added
      case 'newest':
      case 'oldest':
      default:
        return 0;
    }
  });
  const handleDeleteClick = (id: string) => {
    setSelectedListing(id);
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    // In a real app, this would delete the listing via API
    console.log('Deleting listing:', selectedListing);
    setDeleteModalOpen(false);
    setSelectedListing(null);
  };
  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Please sign in</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            You need to be logged in to view your listings.
          </p>
          <Link to="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>;
  }
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Listings</h1>
          <Link to="/add-product">
            <Button variant="primary" className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Listing
            </Button>
          </Link>
        </div>
        {/* Filters - Desktop */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Select id="category" label="Filter by Category" options={categories} value={categoryFilter} onChange={setCategoryFilter} className="w-48" />
          </div>
          <div className="flex items-center">
            <Select id="sort" label="Sort By" options={sortOptions} value={sortOption} onChange={setSortOption} className="w-48" />
          </div>
        </div>
        {/* Filters - Mobile */}
        <div className="md:hidden mb-6">
          <button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className={`w-full flex items-center justify-between p-3 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 mr-2" />
              <span>Filters & Sort</span>
            </div>
            <SlidersIcon className="h-5 w-5" />
          </button>
          {isMobileFilterOpen && <div className={`mt-2 p-4 rounded-md shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="space-y-4">
                <Select id="mobile-category" label="Filter by Category" options={categories} value={categoryFilter} onChange={setCategoryFilter} fullWidth />
                <Select id="mobile-sort" label="Sort By" options={sortOptions} value={sortOption} onChange={setSortOption} fullWidth />
              </div>
            </div>}
        </div>
        {/* Listings */}
        {filteredListings.length > 0 ? <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredListings.map(listing => <li key={listing.id} className="p-6">
                  <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <img src={listing.imageUrl} alt={listing.title} className="w-full md:w-32 h-32 rounded-md object-cover" />
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 md:ml-6">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            {listing.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {listing.category} • {listing.condition}
                          </p>
                          <p className="mt-1 text-sm line-clamp-2">
                            {listing.description}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 md:text-right">
                          <p className="text-lg font-medium text-green-600">
                            ${listing.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quantity: {listing.quantity}
                          </p>
                          {listing.isEcoFriendly && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Eco-Friendly
                            </span>}
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
                        <Link to={`/edit-product/${listing.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="flex items-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700" onClick={() => handleDeleteClick(listing.id)}>
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>)}
            </ul>
          </div> : <div className={`rounded-lg p-8 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-xl font-medium mb-2">No listings found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You haven't created any listings yet or no listings match your
              filters.
            </p>
            <Link to="/add-product">
              <Button variant="primary" className="flex items-center mx-auto">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Listing
              </Button>
            </Link>
          </div>}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setDeleteModalOpen(false)}></div>
            <div className={`relative rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl p-6`}>
              <h3 className="text-lg font-medium mb-4">Delete Listing</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this listing? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
export default MyListingsPage;