import axios from "axios";
import { API_BASE_URL, getHeaders, API_URLS } from "../constant";

export const createOrderAPI = async (orderRequest) => {
  const url = API_BASE_URL + API_URLS.GET_ORDERS; 
  try {
    const response = await axios.post(url, orderRequest, { headers: getHeaders() });
    return response.data;
  } catch (err) {
    console.error("createOrderAPI error:", err.response || err);
    throw err;
  }
};

// 🧾 Lấy danh sách đơn hàng
export const getAllOrdersAPI = async () => {
  const url = API_BASE_URL + API_URLS.GET_ORDERS;
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    // 🔒 đảm bảo luôn trả về mảng (tránh lỗi undefined trong React)
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("getAllOrdersAPI error:", err.response || err);
    throw err;
  }
};

// 🔍 Lấy chi tiết đơn hàng theo ID
export const getOrderByIdAPI = async (orderId) => {
  const url = API_BASE_URL + API_URLS.GET_ORDER_BY_ID(orderId);
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (err) {
    console.error("getOrderByIdAPI error:", err.response || err);
    throw err;
  }
};

// 📦 Tra cứu đơn hàng theo mã và email (public)
export const trackOrderAPI = async (orderId, email) => {
  const url = API_BASE_URL + API_URLS.TRACK_ORDER(orderId, email);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error("trackOrderAPI error:", err.response || err);
    throw err;
  }
};

export const cancelOrderAPI = async (orderId) => {
  const url = `${API_BASE_URL}${API_URLS.CANCEL_ORDER(orderId)}`;
  try {
    const response = await axios.post(url, {}, { headers: getHeaders() });
    return response.data;
  } catch (err) {
    console.error("cancelOrderAPI error:", err.response || err);
    throw err;
  }
};

// Cập nhật đơn hàng 
export const updateOrderAPI = async (orderRequest) => {
  const url = API_BASE_URL + API_URLS.UPDATE_ORDER(orderRequest.id);
  try {
    const response = await axios.put(url, orderRequest, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error("updateOrderAPI error:", err.response || err);
    throw err;
  }
};

// 🔗 Gọi VNPay tạo URL thanh toán
export const createVnPayPaymentAPI = async (orderId, bankCode = "") => {
  const url = API_BASE_URL + API_URLS.GET_VNPAY_PAYMENT(orderId, bankCode);
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (err) {
    console.error("createVnPayPaymentAPI error:", err.response || err);
    throw err;
  }
};


