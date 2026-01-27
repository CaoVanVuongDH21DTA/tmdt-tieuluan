import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant";

// 🟢 Lấy danh sách wishlist của user
export const getWishlistByUser = async (userId) => {
  try {
    const result = await axios.get(API_BASE_URL + API_URLS.GET_WISHLIST(userId), {
      headers: getHeaders(),
    });
    return result?.data;
  } catch (err) {
    console.error("Lỗi khi lấy wishlist:", err);
    throw err;
  }
};

// 🟡 Thêm sản phẩm vào wishlist
export const addToWishlist = async (userId, productId) => {
  try {
    const result = await axios.post(
      API_BASE_URL + API_URLS.ADD_TO_WISHLIST(userId, productId),
      {},
      { headers: getHeaders() }
    );
    return result?.data;
  } catch (err) {
    console.error("Lỗi khi thêm vào wishlist:", err);
    throw err;
  }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (userId, productId) => {
  try {
    const res = await axios.delete(
      API_BASE_URL + API_URLS.REMOVE_FROM_WISHLIST(userId, productId),
      { headers: getHeaders() }
    );
    return res;
  } catch (err) {
    console.error("Lỗi khi xóa khỏi wishlist:", err);
    throw err;
  }
};

