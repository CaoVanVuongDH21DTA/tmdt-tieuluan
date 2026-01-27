import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant";

export const fetchBrands = async () => {
  const url = API_BASE_URL + API_URLS.GET_BRANDS;

  try {
    const result = await axios.get(url, { headers: getHeaders() }); 
    return result.data; 
  } catch (e) {
    console.error('Fetch brands error:', e);
  }
};
