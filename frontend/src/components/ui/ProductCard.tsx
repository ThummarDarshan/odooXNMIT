import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, BadgeCheckIcon, LeafIcon, ShoppingCartIcon } from 'lucide-react';
import { Product } from '../../data/types';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
interface ProductCardProps {
  product: Product;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product
}) => {
  const {
    theme
  } = useTheme();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  const navigateToProduct = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    addToCart(product);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      setIsAddingToCart(false);
      setShowAddedMessage(true);
      // Hide the success message after 2 seconds
      setTimeout(() => {
        setShowAddedMessage(false);
      }, 2000);
    }, 500);
  };


  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackImage = () => {
    // Return a placeholder image based on category
    const categoryImages = {
      'Furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Clothing': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Home Decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Sports': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Toys': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    };
    return categoryImages[product.category as keyof typeof categoryImages] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  };
  return <div className={`rounded-lg overflow-hidden shadow-md transition-all duration-300 ${isHovered ? 'shadow-lg transform -translate-y-1' : ''} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={navigateToProduct}>
      <div className="relative">
        <img 
          src={imageError ? getFallbackImage() : product.imageUrl} 
          alt={product.title} 
          className="w-full h-48 object-cover" 
          onError={handleImageError}
          loading="lazy"
        />
        {/* Wishlist Button */}
        <button onClick={handleWishlist} className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors" aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
          <HeartIcon className={`h-5 w-5 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
        </button>
        {/* Eco Badge */}
        {product.isEcoFriendly && <div className="absolute bottom-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <LeafIcon className="h-3 w-3 mr-1" />
            Eco-Friendly
          </div>}
        {/* View Button on Hover */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            View Details
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium line-clamp-1">{product.title}</h3>
          <span className="font-bold text-green-600">
            ₹{product.price.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="capitalize">{product.condition}</span>
          <span className="mx-2">•</span>
          <span>{product.category}</span>
        </div>
        {/* Seller Info */}
        <div className="mt-3 flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Sold by
          </span>
          <span className="ml-1 text-sm font-medium flex items-center">
            {product.seller.name}
            {product.seller.isVerified && <BadgeCheckIcon className="h-4 w-4 text-blue-500 ml-1" />}
          </span>
        </div>
        {/* Sustainability Score */}
        {product.sustainabilityScore && <div className="mt-2">
            <div className="flex items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Sustainability
              </div>
              <div className="ml-auto text-xs font-medium">
                {product.sustainabilityScore}/100
              </div>
            </div>
            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{
            width: `${product.sustainabilityScore}%`
          }}></div>
            </div>
          </div>}
        
        {/* Add to Cart Button */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isAddingToCart
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : showAddedMessage
                ? 'bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <ShoppingCartIcon className="h-3 w-3" />
            {isAddingToCart ? 'Adding...' : showAddedMessage ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>;
};
export default ProductCard;