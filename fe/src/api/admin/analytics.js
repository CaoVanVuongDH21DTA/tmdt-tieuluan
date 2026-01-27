import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant";

// Doanh thu & lợi nhuận
export const getRevenueAnalytics = async () => {
  const res = await axios.get(API_BASE_URL + API_URLS.GET_ANALYTICS_REVENUE, {
    headers: getHeaders(),
  });
  return res.data;
};

// Tăng trưởng người dùng
export const getUserGrowthAnalytics = async () => {
  const res = await axios.get(API_BASE_URL + API_URLS.GET_ANALYTICS_USER_GROWTH, {
    headers: getHeaders(),
  });
  return res.data;
};

// Phân bổ doanh thu theo danh mục
export const getCategoryDistributionAnalytics = async () => {
  const res = await axios.get(API_BASE_URL + API_URLS.GET_ANALYTICS_CATEGORY, {
    headers: getHeaders(),
  });
  return res.data;
};

// Top sản phẩm bán chạy
export const getTopProductsAnalytics = async () => {
  const res = await axios.get(API_BASE_URL + API_URLS.GET_ANALYTICS_TOP_PRODUCTS, {
    headers: getHeaders(),
  });
  return res.data;
};
