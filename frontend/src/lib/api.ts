// Lightweight API client with auth token support and helpers
import type { Product } from '../data/types';

const API_BASE = '/api';
const BACKEND_BASE_URL = 'http://localhost:5000';

// Utility function to convert relative image URLs to full URLs
export function getFullImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'; // Default placeholder
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative URL (starts with /), prepend the backend base URL
  if (imageUrl.startsWith('/')) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path and prepend the backend base URL
  return `${BACKEND_BASE_URL}/${imageUrl}`;
}

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  [key: string]: any;
} & T;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getStoredToken(): string | null {
  if (authToken) return authToken;
  const t = localStorage.getItem('auth_token');
  authToken = t;
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  // Only set JSON header when not sending FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  Object.assign(headers, options.headers || {});

  const token = getStoredToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const error = new Error(data?.message || 'Request failed');
    (error as any).status = resp.status;
    (error as any).data = data;
    throw error;
  }
  return data as ApiResponse<T>;
}

// Auth APIs
export const authApi = {
  register(displayName: string, email: string, password: string) {
    return request<{ token: string; user: any }>(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password })
    });
  },
  login(email: string, password: string) {
    return request<{ token: string; user: any }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  verify() {
    return request<{ user: any }>(`/auth/verify`, { method: 'POST' });
  },
  me() {
    return request<{ user: any }>(`/auth/me`, { method: 'GET' });
  },
  refresh() {
    return request<{ token: string; user: any }>(`/auth/refresh`, { method: 'POST' });
  }
};

// Users APIs
export const usersApi = {
  updateProfile(payload: { displayName?: string; email?: string }) {
    return request<{ user: any }>(`/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  uploadProfileImage(file: File) {
    const form = new FormData();
    form.append('image', file);
    return request<{ imageUrl: string }>(`/users/profile/image`, {
      method: 'POST',
      body: form
    });
  },
  changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return request<{}>(`/users/password`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  stats() {
    return request<{ stats: any }>(`/users/stats`, { method: 'GET' });
  }
};

// Products APIs
export const productsApi = {
  list(params: Record<string, string | number | boolean | undefined> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString();
    return request<{ products: Product[]; pagination: any }>(`/products${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  get(id: string) {
    return request<{ product: Product & { images?: { url: string; isPrimary: boolean; order: number }[]; inWishlist?: boolean } }>(`/products/${id}`, { method: 'GET' });
  },
  create(data: {
    title: string; description: string; price: number; categoryId: number; condition: Product['condition']; quantity?: number;
    year?: number; brand?: string; dimensions?: string; weight?: string; material?: string; hasWarranty?: boolean; hasManual?: boolean; isEcoFriendly?: boolean; sustainabilityScore?: number; images?: File[];
  }) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'images' && Array.isArray(v)) {
        v.forEach((file) => form.append('images', file as unknown as File));
      } else if (typeof v === 'boolean') {
        form.append(k, v ? 'true' : 'false');
      } else {
        form.append(k, String(v as any));
      }
    });
    return request<{ product: Partial<Product> }>(`/products`, { method: 'POST', body: form });
  },
  update(id: string, data: Record<string, any>) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'images' && Array.isArray(v)) {
        v.forEach((file) => form.append('images', file as unknown as File));
      } else if (typeof v === 'boolean') {
        form.append(k, v ? 'true' : 'false');
      } else {
        form.append(k, String(v));
      }
    });
    return request<{}>(`/products/${id}`, { method: 'PUT', body: form });
  },
  remove(id: string) {
    return request<{}>(`/products/${id}`, { method: 'DELETE' });
  },
  myListings(params: Record<string, string | number | boolean | undefined> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString();
    return request<{ products: Product[]; pagination: any }>(`/products/user/listings${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  categories() {
    return request<{ categories: { id: number; name: string; description?: string }[] }>(`/products/meta/categories`, { method: 'GET' });
  },
  addToWishlist(productId: string) {
    return request<{}>(`/products/${productId}/wishlist`, { method: 'POST' });
  },
  removeFromWishlist(productId: string) {
    return request<{}>(`/products/${productId}/wishlist`, { method: 'DELETE' });
  },
  wishlist(params: { page?: number; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return request<{ products: Product[]; pagination: any }>(`/products/user/wishlist${query ? `?${query}` : ''}`, { method: 'GET' });
  }
};

// Cart APIs
export const cartApi = {
  get() {
    return request<{ items: { id: number; product: Product; quantity: number }[]; summary: { totalItems: number; totalPrice: number } }>(`/cart`, { method: 'GET' });
  },
  add(productId: string, quantity = 1) {
    return request<{}>(`/cart/add`, { method: 'POST', body: JSON.stringify({ productId: Number(productId), quantity }) });
  },
  update(itemId: number, quantity: number) {
    console.log('API: Updating cart item', itemId, 'with quantity', quantity);
    return request<{}>(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
  },
  remove(itemId: number) {
    return request<{}>(`/cart/${itemId}`, { method: 'DELETE' });
  },
  clear() {
    return request<{}>(`/cart`, { method: 'DELETE' });
  }
};

// Purchases APIs
export const purchasesApi = {
  checkout(payload: { shippingAddress?: string } = {}) {
    return request<{ order: { id: number; totalAmount: number; status: string; itemCount: number } }>(`/purchases/checkout`, { method: 'POST', body: JSON.stringify(payload) });
  },
  history(params: { page?: number; limit?: number; status?: string } = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    const query = qs.toString();
    return request<{ orders: any[]; pagination: any }>(`/purchases/history${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  order(orderId: string) {
    return request<{ order: any }>(`/purchases/${orderId}`, { method: 'GET' });
  },
  cancel(orderId: string) {
    return request<{}>(`/purchases/${orderId}/cancel`, { method: 'PUT' });
  },
  sellerAnalytics() {
    return request<{ data: any }>(`/purchases/seller/analytics`, { method: 'GET' });
  }
};


