import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../../utils/jwt-helper";
import { showCustomToast } from "../Toaster/ShowCustomToast";

//Đã đăng nhập rồi ko thể vào trang login register
const PublicRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isTokenValid()) {
      showCustomToast("Bạn đã đăng nhập.", "info");
      navigate("/");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default PublicRoute;
