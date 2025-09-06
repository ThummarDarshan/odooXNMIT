import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../data/types';
import { myListings } from '../data/dummyData';

interface ListingsContextType {
  listings: Product[];
  addListing: (product: Product) => void;
  updateListing: (id: string, product: Product) => void;
  deleteListing: (id: string) => void;
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
  const [listings, setListings] = useState<Product[]>(myListings);

  const addListing = (product: Product) => {
    setListings(prev => [product, ...prev]);
  };

  const updateListing = (id: string, updatedProduct: Product) => {
    setListings(prev => 
      prev.map(listing => 
        listing.id === id ? updatedProduct : listing
      )
    );
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(listing => listing.id !== id));
  };

  const getListingById = (id: string) => {
    return listings.find(listing => listing.id === id);
  };

  const value: ListingsContextType = {
    listings,
    addListing,
    updateListing,
    deleteListing,
    getListingById,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};
