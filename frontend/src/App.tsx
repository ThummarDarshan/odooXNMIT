import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ListingsProvider } from './context/ListingsContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductPage from './pages/AddProductPage';
import CartPage from './pages/CartPage';
import UserDashboardPage from './pages/UserDashboardPage';
import PreviousPurchasesPage from './pages/PreviousPurchasesPage';
import MyListingsPage from './pages/MyListingsPage';
import WishlistPage from './pages/WishlistPage';
import UserProfilePage from './pages/UserProfilePage';
import EditProductPage from './pages/EditProductPage';
export function App() {
  return <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ListingsProvider>
              <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="product/:id" element={
                  <ProtectedRoute>
                    <ProductDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="add-product" element={
                  <ProtectedRoute>
                    <AddProductPage />
                  </ProtectedRoute>
                } />
                <Route path="edit-product/:id" element={
                  <ProtectedRoute>
                    <EditProductPage />
                  </ProtectedRoute>
                } />
                <Route path="cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="purchases" element={
                  <ProtectedRoute>
                    <PreviousPurchasesPage />
                  </ProtectedRoute>
                } />
                <Route path="listings" element={
                  <ProtectedRoute>
                    <MyListingsPage />
                  </ProtectedRoute>
                } />
                <Route path="wishlist" element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
              </BrowserRouter>
            </ListingsProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>;
}