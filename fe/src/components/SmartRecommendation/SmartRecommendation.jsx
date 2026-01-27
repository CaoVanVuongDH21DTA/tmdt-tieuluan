import { useCallback } from "react";
import { ProductCarousel } from "../ProductCarousel/ProductCarousel"; 
import { getTrendingIds, getPurchasedBasedIds, getHistoryBasedIds, getUserCollaborativeIds } from "../../api/apiRecommend";
import { Recommend as RecommendIcon, TrendingUp as TrendingUpIcon, ShoppingBag as ShoppingBagIcon } from '@mui/icons-material';

export const SmartRecommendation = ({ user, hasOrders }) => {
  const getRecommendationConfig = useCallback(() => {

    // User đã mua → mua tiếp
    // Gợi ý những sản phẩm cùng loại --- Đã đăng nhập
    if (user && hasOrders) {
      return {
        title: "Gợi ý dựa trên đơn hàng của bạn",
        icon: <RecommendIcon fontSize="medium" />,
        fetchFn: (limit) => getPurchasedBasedIds(user.id, limit)
      };
    }

    // Gợi ý sản phẩm người có cùng gu đã xem những sản phẩm nào --- Đã đăng nhập
    // Nếu ko đủ sản phẩm giới hạn thì sẽ tự động lấy danh sách sản phẩm được xem nhiều nhất trong 7 ngày qua
    // và nếu ko được xem nhiều nhất trong 7 ngày qua sẽ lấy sản phẩm được bán chạy nhất trong 7 ngày qua
    if (user) {
      return {
        title: "Gợi ý sản phẩm",
        icon: <RecommendIcon fontSize="medium" />,
        fetchFn: (limit) => getUserCollaborativeIds(user.id, limit)
      };
    }

    // Guest có lịch sử xem --- Khách vãng lai
    // Hiển thị ra danh sách sản phẩm người dùng đã xem trước đó được lưu trong localStorage
    const localViewed = JSON.parse(localStorage.getItem("viewed_products") || "[]");
    if (localViewed.length > 0) {
      return {
        title: "Có thể bạn sẽ thích",
        icon: <ShoppingBagIcon fontSize="medium" />,
        fetchFn: (limit) => getHistoryBasedIds(localViewed, limit)
      };
    }

    // Người dùng hoàn toàn mới --- Khách vãng lai
    // Hiển thị ra sản phẩm được xem nhất trong 7 ngày qua, nếu ko có thì sẽ lấy sản phẩm bán chạy 7 ngày qua 
    return {
      title: "Xu hướng tìm kiếm",
      icon: <TrendingUpIcon fontSize="medium" />,
      fetchFn: (limit) => getTrendingIds(limit)
    };

  }, [user, hasOrders]);

  const config = getRecommendationConfig();

  return (
    <ProductCarousel 
      title={config.title}
      icon={config.icon}
      fetchIdsFunction={config.fetchFn}
      limit={8}
    />
  );
};
