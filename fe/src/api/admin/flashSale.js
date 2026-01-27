import axios from 'axios';
import { API_BASE_URL, API_URLS, getHeaders } from '../constant'; // Nhớ sửa đường dẫn import đúng

// 1. Lấy danh sách Flash Sale
export const getAllFlashSales = async () => {
  const url = API_BASE_URL + API_URLS.GET_FLASH_SALES;

  try {
    const response = await axios.get(url, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error("Lỗi API getAllFlashSales:", err);
    throw err;
  }
};

// 2. Lấy chi tiết 1 Flash Sale (để Edit)
export const getFlashSaleDetail = async (id) => {
  const url = API_BASE_URL + API_URLS.GET_FLASH_SALE_DETAIL(id);

  try {
    const response = await axios.get(url, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error(`Lỗi API getFlashSaleDetail (ID: ${id}):`, err);
    throw err;
  }
};

// 3. Tạo mới hoặc Cập nhật (Upsert)
// Backend dùng chung 1 endpoint POST cho cả Create và Update
export const saveFlashSale = async (dataPayload) => {
  const url = API_BASE_URL + API_URLS.GET_FLASH_SALES;

  try {
    const response = await axios.post(url, dataPayload, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error("Lỗi API saveFlashSale:", err);
    throw err;
  }
};

// 4. Xóa Flash Sale
export const deleteFlashSale = async (id) => {
  const url = API_BASE_URL + API_URLS.GET_FLASH_SALE_DETAIL(id); // Dùng chung URL định dạng ID

  try {
    const response = await axios.delete(url, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error(`Lỗi API deleteFlashSale (ID: ${id}):`, err);
    throw err;
  }
};