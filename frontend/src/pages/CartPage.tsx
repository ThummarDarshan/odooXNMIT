import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { TrashIcon, MinusIcon, PlusIcon, CheckIcon, XIcon } from 'lucide-react';
const CartPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice
  } = useCart();
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };
  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };
  const processCheckout = () => {
    setIsProcessing(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsProcessing(false);
      setIsCheckoutComplete(true);
      clearCart();
      // Redirect to purchases after successful checkout
      setTimeout(() => {
        setShowCheckoutModal(false);
        navigate('/purchases');
      }, 3000);
    }, 2000);
  };
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Cart</h1>
        {items.length === 0 ? <div className={`rounded-lg p-8 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden`}>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map(item => <li key={item.product.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row">
                        {/* Product Image */}
                        <div className="flex-shrink-0 mb-4 sm:mb-0">
                          <img src={item.product.imageUrl} alt={item.product.title} className="w-full sm:w-24 h-24 rounded-md object-cover" />
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 sm:ml-6">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium">
                                {item.product.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.product.category} •{' '}
                                {item.product.condition}
                              </p>
                              <p className="mt-1 text-sm">
                                Sold by {item.product.seller.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-medium text-green-600">
                                ₹{item.product.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ₹
                                {(item.product.price * item.quantity).toFixed(2)}{' '}
                                total
                              </p>
                            </div>
                          </div>
                          {/* Quantity and Remove */}
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center border rounded-md">
                              <button type="button" className={`p-2 ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="px-4">{item.quantity}</span>
                              <button type="button" className="p-2" onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}>
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 flex items-center">
                              <TrashIcon className="h-5 w-5 mr-1" />
                              <span className="text-sm">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>)}
                </ul>
              </div>
            </div>
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {/* Individual Items */}
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.product.title}</span>
                          {item.quantity > 1 && (
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              × {item.quantity}
                            </span>
                          )}
                        </div>
                        <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Subtotal */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  {/* Tax */}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  
                  {/* Total */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>₹{(totalPrice * 1.08).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Including taxes and shipping
                    </p>
                  </div>
                  <Button variant="primary" fullWidth onClick={handleCheckout}>
                    Checkout
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => navigate('/')}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </div>}
      </div>
      {/* Checkout Modal */}
      {showCheckoutModal && <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => !isProcessing && !isCheckoutComplete && setShowCheckoutModal(false)}></div>
            <div className={`relative rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl p-6`}>
              {isCheckoutComplete ? <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">
                    Order Successful!
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Thank you for your purchase. Your order has been placed
                    successfully.
                  </p>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to your purchases...
                  </p>
                </div> : <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Complete Your Order</h3>
                    {!isProcessing && <button type="button" className="text-gray-500" onClick={() => setShowCheckoutModal(false)}>
                        <XIcon className="h-5 w-5" />
                      </button>}
                  </div>
                  <div className="mt-4">
                    <div className="border-t border-b py-4 border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount</span>
                        <span>₹{(totalPrice * 1.08).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {isProcessing ? <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                          <p className="mt-4 text-gray-500 dark:text-gray-400">
                            Processing your order...
                          </p>
                        </div> : <>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Click the button below to complete your purchase. In
                            a real app, this would take you to a secure payment
                            page.
                          </p>
                          <Button variant="primary" fullWidth onClick={processCheckout}>
                            Complete Purchase
                          </Button>
                        </>}
                    </div>
                  </div>
                </>}
            </div>
          </div>
        </div>}
    </div>;
};
export default CartPage;