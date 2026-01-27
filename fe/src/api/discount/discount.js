// src/api/discount.js
import axios from "axios";
import { API_BASE_URL, getHeaders, API_URLS } from "../constant";

/* =========================================================
   PHẦN DÀNH CHO USER
========================================================= */

// Lấy toàn bộ discount (cho user)
export const getAllDiscount = async () => {
  const url = API_BASE_URL + API_URLS.GET_ALL_DISCOUNT;

  try {
    const result = await axios.get(url, {
      headers: getHeaders(),
    });
    return result?.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách discount:", err);
    throw err;
  }
};

// Lấy discount dựa theo userId (cho user)
export const getDiscountByUser = async (userId) => {
  const url = API_BASE_URL + API_URLS.GET_DISCOUNT_USER(userId);
  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi getDiscountByUser:", err);
    return [];
  }
};

/* =========================================================
   PHẦN DÀNH CHO ADMIN
========================================================= */

// Lấy tất cả discount (admin)
export const fetchDiscounts = async () => {
  try {
    const result = await axios.get(
      `${API_BASE_URL}${API_URLS.GET_ALL_DISCOUNT}`,
      { headers: getHeaders() }
    );
    return result.data;
  } catch (error) {
    console.error("Error fetching discounts:", error);
    throw error;
  }
};

// Tạo discount mới (admin)
export const saveDiscount = async (discountData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_URLS.GET_ALL_DISCOUNT}`,
      discountData,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving discount:", error);
    throw error;
  }
};

// Cập nhật discount (admin)
export const updateDiscount = async (id, discountData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_URLS.GET_ALL_DISCOUNT}/${id}`,
      discountData,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating discount:", error);
    throw error;
  }
};

// Xóa discount (admin)
export const deleteDiscount = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_URLS.GET_ALL_DISCOUNT}/${id}`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting discount:", error);
    throw error;
  }
};

// Bật/tắt trạng thái discount (admin)
export const updateDiscountStatus = async (id, active) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}${API_URLS.GET_ALL_DISCOUNT}/${id}/status?active=${active}`,
      null,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating discount status:", error);
    throw error;
  }
};

export const distributeDiscountToAllUsers = async (discountId) => {
  try {
    const url = `${API_BASE_URL}${API_URLS.DISTRIBUTE_DISCOUNT(discountId)}`;
    
    const response = await axios.post(
      url, 
      {}, // Body rỗng vì id đã nằm trên url
      { headers: getHeaders() }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error distributing discount:", error);
    throw error;
  }
};
