import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant";
import { getToken } from "../../utils/jwt-helper";

export const getAllUser = async ()=>{
    const url = API_BASE_URL + API_URLS.GET_USERS;
    try{
        const response = await axios.get(url,{
            headers:getHeaders()
        });

        return response?.data || null;
    }
    catch(err){
        console.error("Lỗi khi lấy thông tin user: ", err);
        return null;
    }
}

export const updateUserById = async (id, userData) => {
  const url = `${API_BASE_URL}/api/user/${id}`;
  try {
    const response = await axios.put(url, userData, {
      headers: getHeaders()
    });
    return response?.data;
  } catch (err) {
    console.error("Lỗi khi cập nhật user:", err);
    throw err;
  }
};

export const deleteUserById = async (id) => {
  const url = `${API_BASE_URL}/api/user/${id}`;
  try {
    const response = await axios.delete(url, {
      headers: getHeaders()
    });
    return response?.data;
  } catch (err) {
    console.error("Lỗi khi xóa user:", err);
    throw err;
  }
};

export const forgotPasswordRandom = async (email) => {
  const url = API_BASE_URL + API_URLS.FORGOT_PASSWORD_RANDOM;
  try {
    const response = await axios.post(
      url,
      { email },
      {
        headers: getHeaders(),
      }
    );
    return response?.data || null;
  } catch (err) {
    console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", err);
    return null;
  }
};

export const fetchUserDetails = async () => {
  const token = getToken();

  if (!token) return null;

  try {
    const response = await axios.get(API_BASE_URL + '/api/user/profile', {
      headers: getHeaders()
    });
    return response?.data;
  } catch (err) {
    if (err.response?.status === 401) {
      console.warn("Token không hợp lệ hoặc hết hạn");
      return null;
    }
    console.error("Lỗi khi lấy thông tin user: ", err);
    return null;
  }
};

export const updateUserDetails = async (formData) => {
  const url = API_BASE_URL + '/api/user/profile';
  try {
    const response = await axios.put(url, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response?.data;
  } catch (err) {
    console.error("Update failed", err);
    throw err;
  }
};

export const addAddressAPI = async (data)=>{
    const url = API_BASE_URL + '/api/address';
    try{
        const response = await axios(url,{
            method:"POST",
            data:data,
            headers:getHeaders()
        });
        return response?.data;
    }
    catch(err){
        throw new Error(err);
    }
}

export const deleteAddressAPI = async (id)=>{
    const url = API_BASE_URL + `/api/address/${id}`;
    try{
        const response = await axios(url,{
            method:"DELETE",
            headers:getHeaders()
        });
        return response?.data;
    }
    catch(err){
        throw new Error(err);
    }
}

export const updateAddressAPI = async (id, data) => {
  const url = API_BASE_URL + `/api/address/${id}`;
  try {
    const response = await axios.put(url, data, {
      headers: getHeaders()
    });
    return response?.data;
  } catch (err) {
    console.error("Update failed", err);
    throw err;
  }
};

export const fetchOrderAPI = async ()=>{
    const url = API_BASE_URL + `/api/order/user`;
    try{
        const response = await axios(url,{
            method:"GET",
            headers:getHeaders()
        });
        return response?.data;
    }
    catch(err){
        throw new Error(err);
    }
}

export const cancelOrderAPI = async (id)=>{
    const url = API_BASE_URL + `/api/order/cancel/${id}`;
    try{
        const response = await axios(url,{
            method:"POST",
            headers:getHeaders()
        });
        return response?.data;
    }
    catch(err){
        throw new Error(err);
    }
}

export const getAllRoles = async () => {
    const url = `${API_BASE_URL}/api/roles`;
    try {
        const response = await axios.get(url, {
            headers: getHeaders() 
        });
        return response.data;
    } catch (err) {
        console.error("Lỗi lấy danh sách role:", err);
        throw err;
    }
};

export const requestChangeEmailAPI = async (data) => {
    const url = `${API_BASE_URL}/api/user/request-change-email`;
    try {
        const response = await axios.post(url, data, {
            headers: getHeaders(),
        });
        return response.data;
    } catch (err) {
        console.error("Lỗi lấy danh sách role:", err);
        throw err;
    }
};

export const verifyChangeEmailAPI = async (data) => {
    const url = `${API_BASE_URL}/api/user/verify-change-email`;
    try {
        const response = await axios.post(url, data, {
            headers: getHeaders() 
        });
        return response.data;
    } catch (err) {
        console.error("Lỗi lấy danh sách role:", err);
        throw err;
    }
};
