import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant";

export const getAllProductsHome = async ()=>{
    let url = API_BASE_URL + API_URLS.GET_PRODUCTS;

    try{
        const result = await axios(url,{
            method:"GET"
        });
        return result?.data;
    }
    catch(err){
        console.error(err);
    }
}

export const createProduct = async (productData) => {
  try {
    const res = await axios.post(API_BASE_URL + API_URLS.GET_PRODUCTS, productData, { headers: getHeaders() });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
    throw err;
  }
};

export const updateProductById = async (id, productData) => {
  const url = API_BASE_URL + API_URLS.GETID_PRODUCT(id);
  try {
    const response = await axios.put(url, productData, { headers:getHeaders() });
    return response?.data;
  } catch (err) {
    console.error("Lỗi khi cập nhật sản phẩm:", err);
    throw err;
  }
};

export const deleteProductById = async (id) => {
  const url = API_BASE_URL + API_URLS.GETID_PRODUCT(id);
  try {
    const result = await axios.delete(url, { headers: getHeaders() });
    return result?.data; // server trả về ProductDto đã disable
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
    throw err;
  }
};

export const toggleProductEnable = async (id, enable) => {
  console.log("enable: ", enable)
  const url = `${API_BASE_URL}${API_URLS.GETID_PRODUCT(id)}/enable?enable=${enable}`;
  try {
    const response = await axios.put(url, {}, { headers: getHeaders() });
    return response?.data;
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái sản phẩm:", err);
    throw err;
  }
};

export const getProductsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    
    const url = `${API_BASE_URL}${API_URLS.GET_PRODUCTS}/by-ids`;
    try {
        // Gửi mảng ID lên bằng method POST
        const response = await axios.post(url, ids, {
            headers: {
                ...getHeaders(),
                'Content-Type': 'application/json'
            }
        });
        return response.data; 
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết sản phẩm từ Java:", err);
        return [];
    }
};
