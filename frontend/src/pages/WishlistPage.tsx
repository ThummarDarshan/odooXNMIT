import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from 'lucide-react';

const WishlistPage: React.FC = () => {
  const { theme } = useTheme();
  const { items, removeFromWishlist, clearWishlist, totalItems } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    items.forEach(item => addToCart(item));
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <HeartIcon className="h-8 w-8 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            {totalItems > 0 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  Add All to Cart
                </button>
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        {totalItems > 0 ? (
          <div>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map(product => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white transition-colors z-10"
                    aria-label="Remove from wishlist"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start adding items you love to your wishlist by clicking the heart icon on any product.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Start Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
