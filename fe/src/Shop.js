import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; 

// --- IMPORT ICONS ---
import { 
  EmojiEvents as BestSellerIcon, 
  History as HistoryIcon,       
  ShoppingBag as ShoppingBagIcon 
} from '@mui/icons-material';

// --- IMPORT API ---
import { getBestSellerIds, fetchViewedProductIds, getBuyAgainProducts } from "./api/apiRecommend";

// --- COMPONENTS ---
import HeroSection from "./components/HeroSection/HeroSection";
import { FlashSaleProducts } from "./components/FlashSaleProducts/FlashSaleProducts";
import { DiscoverySection } from "./components/DiscoverySection/DiscoverySection";

// Chỉ cần 2 Component dùng chung này là đủ
import { ProductCarousel } from "./components/ProductCarousel/ProductCarousel";
import { SmartRecommendation } from "./components/SmartRecommendation/SmartRecommendation";

const Shop = () => {
  const user = useSelector((state) => state.userState?.userInfo);
  const isLoggedIn = !!user; 
  
  // State lưu danh sách sản phẩm mua lại
  const [buyAgainList, setBuyAgainList] = useState([]);

  // Fetch dữ liệu Mua Lại khi user login
  useEffect(() => {
    const loadBuyAgain = async () => {
      if (!isLoggedIn) {
        setBuyAgainList([]);
        return;
      }
      // Gọi hàm API mới viết ở Bước 1
      const products = await getBuyAgainProducts(10);
      setBuyAgainList(products);
    };
    loadBuyAgain();
  }, [isLoggedIn]); 

  // Biến kiểm tra có đơn hàng hay không dựa trên list đã fetch
  const hasOrders = buyAgainList.length > 0;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <div className="flex flex-1 bg-gray-50">
        <main className="max-w-[1300px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          
          <HeroSection />

          <div className="mt-6 space-y-12">

            {isLoggedIn && hasOrders && (
               <ProductCarousel 
                  title="Mua lại nhanh" 
                  icon={<ShoppingBagIcon fontSize="medium" className="text-green-600"/>}
                  // Truyền trực tiếp list sản phẩm đã lấy từ API
                  initialProducts={buyAgainList} 
               />
            )}
            
            <FlashSaleProducts />
            <SmartRecommendation user={user} hasOrders={hasOrders} />
            
            <ProductCarousel 
                title="Sản phẩm vừa xem" 
                icon={<HistoryIcon fontSize="medium" className="text-blue-600"/>} 
                // Hàm fetch: ProductCarousel sẽ tự gọi API này để lấy ID -> rồi lấy Detail
                fetchIdsFunction={(limit) => fetchViewedProductIds(user?.id)}
                limit={10}
            />

            {/* 5. SẢN PHẨM BÁN CHẠY */}
            <ProductCarousel 
                title="Sản phẩm bán chạy" 
                icon={<BestSellerIcon fontSize="medium" className="text-yellow-500"/>} 
                fetchIdsFunction={getBestSellerIds}
                limit={10}
            />

            {/* 6. Các phần khác */}
            <DiscoverySection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;