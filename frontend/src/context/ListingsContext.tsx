import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '../data/types';
import { productsApi } from '../lib/api';
import { useAuth } from './AuthContext';

interface ListingsContextType {
  listings: Product[];
  refreshListings: () => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  getListingById: (id: string) => Product | undefined;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};

interface ListingsProviderProps {
  children: ReactNode;
}

export const ListingsProvider: React.FC<ListingsProviderProps> = ({ children }) => {
  const [listings, setListings] = useState<Product[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      void refreshListings();
    } else {
      setListings([]);
    }
  }, [isAuthenticated]);

  const refreshListings = async () => {
    const res = await productsApi.myListings();
    setListings(res.products.map(normalizeProduct));
  };

  const deleteListing = async (id: string) => {
    await productsApi.remove(id);
    await refreshListings();
  };

  const getListingById = (id: string) => {
    return listings.find(listing => listing.id === id);
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
    };
  }

  const value: ListingsContextType = {
    listings,
    refreshListings,
    deleteListing,
    getListingById,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};
