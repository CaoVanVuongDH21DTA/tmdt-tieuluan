import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../../utils/jwt-helper";
import { showCustomToast } from "../Toaster/ShowCustomToast";

//Bảo vệ các trang cần phải đăng nhập
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/auth/login");
      showCustomToast("Xin vui lòng đăng nhập.", "warning");
      return;
    }
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
