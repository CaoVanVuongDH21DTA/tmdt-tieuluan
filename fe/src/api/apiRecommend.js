import axios from 'axios';
import { fetchOrderAPI} from "./user/userInfo"

const PYTHON_API_URL = 'http://127.0.0.1:8000';
const MAIN_BACKEND_URL = 'http://localhost:8080/api'; 
const STORAGE_KEY = 'viewed_products';

export const getBestSellerIds = async (limit) => {
    try {
        const url = `${PYTHON_API_URL}/recommendations/best-sellers?limit=${limit}`;
        const response = await axios.get(url);
        return response.data; 
    } catch (err) {
        return [];
    }
};

// --- LOCAL STORAGE HELPERS ---
const getLocalIds = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
};

const saveLocalIds = (ids) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

// --- 1. TRACKING: Lưu hành động xem ---
export const trackProductView = async (productId, userId = null) => {
    if (!productId) return;

    if (userId) {
        try {
            await axios.post(`${PYTHON_API_URL}/tracking/view`, {
                user_id: userId,
                product_id: productId
            });
        } catch (error) {
            console.error("Tracking DB error:", error);
        }
    } else {
        let history = getLocalIds();
        history = history.filter(id => id !== productId); 
        history.unshift(productId); 
        if (history.length > 15) history.pop(); 
        saveLocalIds(history);
    }
};

// --- 2. SYNC: Đồng bộ khi Login ---
export const syncLocalHistoryToDB = async (userId) => {
    const localIds = getLocalIds();
    if (localIds.length === 0) return;

    try {
        await axios.post(`${PYTHON_API_URL}/tracking/sync`, {
            user_id: userId,
            viewed_ids: localIds
        });
        localStorage.removeItem(STORAGE_KEY); 
    } catch (error) {
        console.error("Sync error:", error);
    }
};

// --- 3. GET HISTORY: Lấy danh sách ID đã xem ---
export const fetchViewedProductIds = async (userId = null) => {
    if (userId) {
        try {
            const res = await axios.get(`${PYTHON_API_URL}/tracking/history/${userId}`);
            return res.data;
        } catch (error) {
            console.error("Get History DB error:", error);
            return [];
        }
    } else {
        return getLocalIds();
    }
};

// --- 5. LẤY CHI TIẾT SẢN PHẨM TỪ BACKEND CHÍNH ---
export const fetchProductsByIds = async (ids) => {
    if(!ids || ids.length === 0) return [];
    try {
        const response = await axios.post(`${MAIN_BACKEND_URL}/products/by-ids`, ids);
        return response.data;
    } catch (error) {
        console.error("Fetch Details error:", error);
        return [];
    }
};

export const getTrendingIds = async (limit = 8) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/recommendations/trending?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching trending:", error);
        return [];
    }
};

// 2. Dựa trên đơn hàng đã mua (Cho khách đã mua)
export const getPurchasedBasedIds = async (userId, limit = 8) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/recommendations/purchased-based/${userId}?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching purchased based:", error);
        return [];
    }
};

// 3. Dựa trên lịch sử xem (Cho khách đang xem/dạo)
export const getHistoryBasedIds = async (viewedIds, limit = 8) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/recommendations/by-history?limit=${limit}`, {
            viewed_ids: viewedIds
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching history based:", error);
        return [];
    }
};

export const getBuyAgainProducts = async (limit = null) => {
  try {
    const orders = await fetchOrderAPI();
    
    if (!orders || orders.length === 0) return [];

    // 1. Lọc đơn hàng (DELIVERED hoặc COMPLETED)
    const completedOrders = orders
      .filter(order => 
          order.orderStatus === "DELIVERED"
      )
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // 2. Map dữ liệu (LẤY TOÀN BỘ)
    const allItems = completedOrders.flatMap(order => 
       order.orderItemList.map(item => {
          const originalProduct = item.product;
          return {
              ...originalProduct, 
          };
       })
    );

    // 3. Lọc trùng lặp
    const uniqueItemsMap = new Map();
    allItems.forEach(item => {
        if (!uniqueItemsMap.has(item.id)) {
            uniqueItemsMap.set(item.id, item);
        }
    });

    const finalResult = Array.from(uniqueItemsMap.values());

    // 4. Trả về
    if (limit) {
        return finalResult.slice(0, limit);
    }
    return finalResult;

  } catch (error) {
    console.error("Error fetching buy again:", error);
    return [];
  }
};

export const getUserCollaborativeIds = async (userId, limit = 8) => {
    if (!userId) return [];

    try {
        const response = await axios.get(
            `${PYTHON_API_URL}/recommendations/user-collaborative/${userId}?limit=${limit}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching user-collaborative:", error);
        return [];
    }
};
