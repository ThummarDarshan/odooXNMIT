import React, { useEffect, useState, createContext, useContext } from 'react';
import { Product } from '../data/types';
import { cartApi } from '../lib/api';
import { useAuth } from './AuthContext';
interface CartItem {
  product: Product;
  quantity: number;
}
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  uniqueItems: number;
  totalPrice: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export const CartProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      void syncFromServer();
    } else {
      setItems([]);
    }

    const handleLogout = () => {
      setItems([]);
    };

    window.addEventListener('userLogout', handleLogout);
    return () => window.removeEventListener('userLogout', handleLogout);
  }, [isAuthenticated]);
  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  const syncFromServer = async () => {
    const res = await cartApi.get();
    setItems(res.items.map((it: any) => ({ product: normalizeProduct(it.product), quantity: it.quantity })));
  };
  const addToCart = async (product: Product) => {
    await cartApi.add(product.id, 1);
    await syncFromServer();
  };
  const removeFromCart = async (productId: string) => {
    const current = await cartApi.get();
    const match = current.items.find((it: any) => String(it.product.id) === String(productId));
    if (match) {
      await cartApi.remove(match.id);
      await syncFromServer();
    }
  };
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      const current = await cartApi.get();
      const match = current.items.find((it: any) => String(it.product.id) === String(productId));
      if (match) {
        console.log('Updating cart item:', { cartItemId: match.id, productId, quantity });
        await cartApi.update(match.id, quantity);
        await syncFromServer();
      } else {
        console.error('Cart item not found for product:', productId);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };
  const clearCart = async () => {
    await cartApi.clear();
    setItems([]);
    localStorage.removeItem('cart');
  };
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const uniqueItems = items.length;
  const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  return <CartContext.Provider value={{
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    uniqueItems,
    totalPrice
  }}>
      {children}
    </CartContext.Provider>;
};
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

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
    quantity: Number(p.quantity || 1),
  } as Product;
}