const KEY = 'viewed_products';
const MAX_HISTORY = 5; // Chỉ lưu 5 sản phẩm gần nhất

export const addToViewedHistory = (productId) => {
    try {
        let history = JSON.parse(localStorage.getItem(KEY) || '[]');
        
        if (history.includes(productId)) {
            return; 
        }
        history.unshift(productId);
        
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }
        
        localStorage.setItem(KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Lỗi lưu history:", error);
    }
};

export const getViewedHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
};