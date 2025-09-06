import React, { useEffect, useState, createContext, useContext } from 'react';
import { Product } from '../data/types';
import { productsApi } from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: Product[];
  loadWishlist: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      void loadWishlist();
    } else {
      setItems([]);
    }

    const handleLogout = () => setItems([]);
    window.addEventListener('userLogout', handleLogout);
    return () => window.removeEventListener('userLogout', handleLogout);
  }, [isAuthenticated]);

  useEffect(() => {
    // Save wishlist to localStorage whenever it changes (local mirror)
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const loadWishlist = async () => {
    const res = await productsApi.wishlist();
    setItems(res.products.map(normalizeProduct));
  };

  const addToWishlist = async (product: Product) => {
    await productsApi.addToWishlist(product.id);
    await loadWishlist();
  };

  const removeFromWishlist = async (productId: string) => {
    await productsApi.removeFromWishlist(productId);
    await loadWishlist();
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
    localStorage.removeItem('wishlist');
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        loadWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
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
