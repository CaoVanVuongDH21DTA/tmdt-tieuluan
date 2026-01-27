import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant"

export const getDashboard = async (params = {}) => {
  const url = API_BASE_URL + API_URLS.GET_DASHBOARD_STATS;

  try {
    const response = await axios.get(url, {
      params, // nếu cần query
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error("Lỗi API getDashboard:", err);
    throw err;
  }
};
