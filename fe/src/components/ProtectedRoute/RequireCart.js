import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { showCustomToast } from "../Toaster/ShowCustomToast";
import { selectCartItems } from "../../store/features/cart";

const RequireCart = ({ children }) => {
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems); 

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      showCustomToast("Giỏ hàng của bạn đang trống. Vui lòng mua sắm thêm!", "warning");
      navigate("/"); 
    }
  }, [cartItems, navigate]);

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return <>{children}</>;
};

export default RequireCart;