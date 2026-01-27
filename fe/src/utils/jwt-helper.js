import { jwtDecode } from "jwt-decode";

//Kiểm tra token còn hạn không
export const isTokenValid = ()=>{
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        return decoded.exp > currentTime;
    } catch (error) {
        console.error("Invalid token", error);
        return false;
    }
}

//Lưu token
export const saveToken = (token) =>{
    localStorage.setItem('authToken',token);
}

//đăng xuất
export const logOut = ()=>{
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart');
    localStorage.removeItem('viewed_products');
    localStorage.removeItem('appliedDiscount');  
}

//Lấy token
export const getToken = ()=>{
    return localStorage.getItem('authToken');
}