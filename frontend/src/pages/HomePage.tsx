import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ui/ProductCard';
import { categories as dummyCategories, conditions, sortOptions } from '../data/dummyData';
import { Product } from '../data/types';
import Select from '../components/ui/Select';
import { FilterIcon, SlidersIcon, SearchIcon } from 'lucide-react';
import { productsApi } from '../lib/api';

const HomePage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>(dummyCategories);

  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.categories();
        const names = ['All Categories', ...res.categories.map(c => c.name)];
        setAllCategories(names);
      } catch (_) {
        setAllCategories(dummyCategories);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.list({
          category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
          condition: selectedCondition !== 'All Conditions' ? selectedCondition : undefined,
          search: searchQuery || undefined,
          sortBy: sortOption
        });
        if (!cancelled) {
          setFilteredProducts(res.products.map(normalizeProduct));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCategory, selectedCondition, sortOption, searchQuery]);
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Hero Banner */}
      <div className="relative">
        <div className="h-80 w-full overflow-hidden">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" alt="Sustainable Shopping Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Shop Sustainably, Live Responsibly
                </h1>
                <p className="text-white text-lg mb-6">
                  Discover unique second-hand items that are good for your
                  wallet and the planet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters - Desktop */}
        <div className="hidden md:flex items-end justify-between mb-8">
          <div className="flex items-end space-x-4">
            {/* Search Bar - Front and High Width */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search for sustainable items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-80 py-2 pl-4 pr-10 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              <button className="absolute right-0 top-6 mt-2 mr-4">
                <SearchIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex items-end space-x-4">
            <Select id="category" label="Category" options={allCategories} value={selectedCategory} onChange={setSelectedCategory} className="w-40" />
            <Select id="condition" label="Condition" options={conditions} value={selectedCondition} onChange={setSelectedCondition} className="w-40" />
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
                {/* Mobile Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for sustainable items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full py-2 pl-4 pr-10 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <button className="absolute right-0 top-0 mt-2 mr-4">
                    <SearchIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <Select id="mobile-category" label="Category" options={allCategories} value={selectedCategory} onChange={setSelectedCategory} fullWidth />
                <Select id="mobile-condition" label="Condition" options={conditions} value={selectedCondition} onChange={setSelectedCondition} fullWidth />
                <Select id="mobile-sort" label="Sort By" options={sortOptions} value={sortOption} onChange={setSortOption} fullWidth />
              </div>
            </div>}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedCategory === 'All Categories' ? 'All Products' : selectedCategory}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({filteredProducts.length} items)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>;
};
export default HomePage;

function normalizeProduct(p: any): Product {
  return {
    id: String(p.id),
    title: p.title,
    description: p.description,
    price: Number(p.price),
    category: p.category,
    condition: p.condition,
    imageUrl: p.imageUrl,
    seller: p.seller || { id: '', name: '', rating: 4.5, isVerified: false },
    year: p.year,
    brand: p.brand,
    dimensions: p.dimensions,
    weight: p.weight,
    material: p.material,
    hasWarranty: p.hasWarranty,
    hasManual: p.hasManual,
    quantity: Number(p.quantity || 1),
    isEcoFriendly: p.isEcoFriendly,
    sustainabilityScore: p.sustainabilityScore,
  } as Product;
}