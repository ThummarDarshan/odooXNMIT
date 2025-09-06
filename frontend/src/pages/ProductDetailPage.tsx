import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useListings } from '../context/ListingsContext';
import { products } from '../data/dummyData';
import { Product } from '../data/types';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import { HeartIcon, BadgeCheckIcon, LeafIcon, TruckIcon, ShieldIcon, AlertCircleIcon, ChevronLeftIcon } from 'lucide-react';
const ProductDetailPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    addToCart
  } = useCart();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useWishlist();
  const {
    getListingById,
    listings
  } = useListings();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  useEffect(() => {
    // First try to find the product in the main products array
    let foundProduct = products.find(p => p.id === id);
    
    // If not found in main products, check user listings
    if (!foundProduct) {
      foundProduct = getListingById(id || '');
    }
    
    if (foundProduct) {
      setProduct(foundProduct);
      // Find related products (same category, excluding current product)
      // Check both main products and listings for related products
      const allProducts = [...products, ...listings];
      const related = allProducts.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0, 4);
      setRelatedProducts(related);
    } else {
      // Product not found
      navigate('/');
    }
  }, [id, navigate, getListingById, listings]);
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };
  const handleToggleWishlist = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };
  if (!product) {
    return <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>;
  }
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className={`flex items-center mb-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to results
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className={`rounded-lg overflow-hidden shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <img src={product.imageUrl} alt={product.title} className="w-full h-auto object-cover" />
            {/* Eco Badge */}
            {product.isEcoFriendly && <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 flex items-center">
                <LeafIcon className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-medium">Eco-Friendly Product</p>
                  <p className="text-sm">
                    This item has been verified as sustainable
                  </p>
                </div>
              </div>}
          </div>
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {product.title}
                </h1>
                <button onClick={handleToggleWishlist} className={`p-2 rounded-full ${isInWishlist(product.id) ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`} aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
                  <HeartIcon className={`h-6 w-6 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                </button>
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-2xl font-bold text-green-600">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  • {product.condition}
                </span>
              </div>
            </div>
            {/* Seller Info */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center">
                <div className="font-medium">Sold by {product.seller.name}</div>
                {product.seller.isVerified && <div className="ml-2 flex items-center text-blue-500">
                    <BadgeCheckIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm">Verified Seller</span>
                  </div>}
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <svg key={i} className={`h-5 w-5 ${i < Math.floor(product.seller.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 15.585l-6.327 3.331 1.209-7.035-5.117-4.981 7.075-1.027L10 0l3.16 6.872 7.075 1.027-5.117 4.981 1.209 7.035z" clipRule="evenodd" />
                      </svg>)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {product.seller.rating.toFixed(1)} rating
                  </span>
                </div>
              </div>
            </div>
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {product.description}
              </p>
            </div>
            {/* Sustainability Score */}
            {product.sustainabilityScore && <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium flex items-center">
                    <LeafIcon className="h-5 w-5 mr-2 text-green-500" />
                    Sustainability Score
                  </h3>
                  <span className="font-bold">
                    {product.sustainabilityScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{
                width: `${product.sustainabilityScore}%`
              }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Buying this second-hand item saves approximately{' '}
                  {Math.round(product.sustainabilityScore / 10)} kg of CO₂
                  emissions.
                </p>
              </div>}
            {/* Product Specifications */}
            <div>
              <h3 className="text-lg font-medium mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                  <p>{product.category}</p>
                </div>
                {product.brand && <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Brand
                    </p>
                    <p>{product.brand}</p>
                  </div>}
                {product.year && <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Year
                    </p>
                    <p>{product.year}</p>
                  </div>}
                {product.material && <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Material
                    </p>
                    <p>{product.material}</p>
                  </div>}
                {product.dimensions && <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dimensions
                    </p>
                    <p>{product.dimensions}</p>
                  </div>}
                {product.weight && <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Weight
                    </p>
                    <p>{product.weight}</p>
                  </div>}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quantity Available
                  </p>
                  <p>{product.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Condition
                  </p>
                  <p>{product.condition}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.hasWarranty && <div className={`flex items-center px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <ShieldIcon className="h-4 w-4 mr-1" />
                    Warranty Included
                  </div>}
                {product.hasManual && <div className={`flex items-center px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    Manual Included
                  </div>}
              </div>
            </div>
            {/* Shipping Info */}
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <TruckIcon className="h-5 w-5 mr-2" />
              <span>Free shipping • Estimated delivery: 3-5 business days</span>
            </div>
            {/* Add to Cart Button */}
            <div className="pt-4">
              <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
        {/* Related Products */}
        {relatedProducts.length > 0 && <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>}
      </div>
    </div>;
};
export default ProductDetailPage;