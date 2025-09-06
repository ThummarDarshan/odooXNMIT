import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { purchases } from '../data/dummyData';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { CalendarIcon, FilterIcon, SlidersIcon } from 'lucide-react';
const PreviousPurchasesPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    isAuthenticated
  } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const categories = ['All Categories', ...Array.from(new Set(purchases.map(p => p.product.category)))];
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
  // Filter and sort purchases
  const filteredPurchases = purchases.filter(purchase => categoryFilter === 'All Categories' || purchase.product.category === categoryFilter).sort((a, b) => {
    switch (sortOption) {
      case 'oldest':
        return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
      case 'price-low':
        return a.product.price - b.product.price;
      case 'price-high':
        return b.product.price - a.product.price;
      case 'newest':
      default:
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    }
  });
  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Please sign in</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            You need to be logged in to view your purchases.
          </p>
          <Link to="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>;
  }
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">
          Previous Purchases
        </h1>
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
        {/* Purchases List */}
        {filteredPurchases.length > 0 ? <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPurchases.map(purchase => <li key={purchase.id} className="p-6">
                  <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <img src={purchase.product.imageUrl} alt={purchase.product.title} className="w-full md:w-32 h-32 rounded-md object-cover" />
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 md:ml-6">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            <Link to={`/product/${purchase.product.id}`} className="hover:text-green-600">
                              {purchase.product.title}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {purchase.product.category} •{' '}
                            {purchase.product.condition}
                          </p>
                          <p className="mt-1 text-sm">
                            Sold by {purchase.product.seller.name}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 md:text-right">
                          <p className="text-lg font-medium text-green-600">
                            ${purchase.product.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quantity: {purchase.quantity}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 md:justify-end">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              Purchased on{' '}
                              {new Date(purchase.purchaseDate).toLocaleDateString()}
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
                </li>)}
            </ul>
          </div> : <div className={`rounded-lg p-8 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-xl font-medium mb-2">No purchases found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You haven't made any purchases yet or no purchases match your
              filters.
            </p>
            <Link to="/">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>}
      </div>
    </div>;
};
export default PreviousPurchasesPage;