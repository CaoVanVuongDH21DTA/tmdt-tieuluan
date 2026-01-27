import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant";

// 1. Lấy danh sách Review (Cây phân cấp)
export const getReviewsByProductId = async (productId) => {
    const url = API_BASE_URL + API_URLS.GET_REVIEWS_BY_PRODUCT(productId);
    try {
        const response = await axios.get(url);
        return response.data; 
    } catch (err) {
        console.error("Lỗi lấy review:", err);
        return [];
    }
};

// 2. Thêm Review hoặc Reply
export const addReview = async (reviewData) => {
    const url = API_BASE_URL + API_URLS.ADD_REVIEW;
    console.log("reviewData: ", reviewData)
    try {
        const response = await axios.post(url, reviewData, { 
            headers: getHeaders() 
        });
        return response.data;
    } catch (err) {
        console.error("Lỗi thêm review:", err);
        throw err;
    }
};