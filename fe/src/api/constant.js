import { getToken } from "../utils/jwt-helper";

export const API_URLS = {
    GET_USERS: '/api/user',
    FORGOT_PASSWORD_RANDOM: '/api/auth/forgot-password-random',

    GET_PRODUCTS:'/api/products',
    SEARCH_PRODUCTS: (query) => `/api/products/search?query=${encodeURIComponent(query)}`,
    GETID_PRODUCT: (productId) => `/api/products/${productId}`,
    
    GET_CATEGORIES:'/api/category',
    GET_CATEGORY_TYPE: (categoryId) => `/api/category/${categoryId}`,

    GET_BRANDS: '/api/brands',

    GET_SHIP: '/api/shipping',

    GET_ORDERS: '/api/order',
    GET_ORDER_BY_ID: (orderId) => `/api/order/${orderId}`,
    UPDATE_ORDER: (id) => `/api/order/${id}`,
    CANCEL_ORDER: (id) => `/api/order/cancel/${id}`,
    TRACK_ORDER: (orderId, email) => `/api/order/search?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`,

    GET_WISHLIST: (userId) => `/api/wishlist/${userId}`,
    ADD_TO_WISHLIST: (userId, productId) => `/api/wishlist/${userId}/${productId}`,
    REMOVE_FROM_WISHLIST: (userId, productId) => `/api/wishlist/${userId}/${productId}`,

    GET_ALL_DISCOUNT: "/api/discount",
    GET_DISCOUNT_USER:(userId) => `/api/discount/user/${userId}`,
    DISTRIBUTE_DISCOUNT: (id) => `/api/discount/${id}/distribute-all`,

    GET_DASHBOARD_STATS: "/api/dashboard",

    GET_ANALYTICS_REVENUE: "/api/analytics/revenue",
    GET_ANALYTICS_USER_GROWTH: "/api/analytics/user-growth",
    GET_ANALYTICS_CATEGORY: "/api/analytics/category-distribution",
    GET_ANALYTICS_TOP_PRODUCTS: "/api/analytics/top-products",

    GET_VNPAY_PAYMENT: (orderId, bankCode = "") => `/api/payment/vnpay/${orderId}${bankCode ? `?bankCode=${bankCode}` : ""}`,
    GET_VNPAY_RETURN: "/api/payment/vnpay-return",

    GET_REVIEWS_BY_PRODUCT: (productId) => `/api/reviews/product/${productId}`,
    ADD_REVIEW: '/api/reviews', 

    GET_FLASH_SALES: '/api/admin/flash-sales',
    GET_FLASH_SALE_DETAIL: (id) => `/api/admin/flash-sales/${id}`,
}

export const API_BASE_URL = 'http://localhost:8080';

export const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
