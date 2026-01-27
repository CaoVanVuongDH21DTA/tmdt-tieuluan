import { useState, useEffect, useRef, useCallback } from "react";
import { getAllProductsHome } from "../../api/product/product"; 
import { Link } from "react-router-dom";
import { calculateItemFinalPrice } from "../../utils/price-util";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../../store/features/user";
import { getWishlistByUser } from "../../api/product/wishlist";

import {
  LocalFireDepartment as FireIcon,
  TrendingUp as TrendingIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import ProductCard from "../../pages/ProductListPage/ProductCard";

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    if (!targetDate) return { d: 0, h: 0, m: 0, s: 0 };
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    } else {
        timeLeft = { d: 0, h: 0, m: 0, s: 0 };
    }
    return timeLeft;
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => { setTimeLeft(calculateTimeLeft()); }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  const Box = ({ val, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/80 rounded flex items-center justify-center">
        <span className="text-white font-bold text-sm sm:text-base">{String(val).padStart(2, "0")}</span>
      </div>
      <span className="text-[10px] sm:text-xs text-white/90 font-medium mt-1 uppercase">
        {label}
      </span>
    </div>
  );
  return (
    <div className="flex items-center gap-1 mx-2">
      {timeLeft.d > 0 && (
        <>
          <Box val={timeLeft.d} label="Ngày" />
          <span className="text-white font-bold pt-1 sm:pt-2 text-xs sm:text-base">:</span>
        </>
      )}
      <Box val={timeLeft.h || 0} label="Giờ" />
      <span className="text-white font-bold pb-2">:</span>
      <Box val={timeLeft.m || 0} label="Phút" />
      <span className="text-white font-bold pb-2">:</span>
      <Box val={timeLeft.s || 0} label="Giây" />
    </div>
  );
};

export const FlashSaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [countDownTarget, setCountDownTarget] = useState(null);
  const autoPlayRef = useRef(null);

  const [wishlistIds, setWishlistIds] = useState([]);
  const userInfo = useSelector(selectUserInfo);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userInfo?.id) return;

      try {
        const data = await getWishlistByUser(userInfo.id);
        if (Array.isArray(data)) {
          setWishlistIds(
            data
              .map(item => item.product?.id)
              .filter(Boolean)
          );
        }
      } catch (e) {
        setWishlistIds([]);
      }
    };

    fetchWishlist();
  }, [userInfo?.id]);

  const handleRemoveFromWishlist = (productId) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProductsHome();
        if (data && Array.isArray(data)) {
          const flashSaleItems = data.filter(p => p.flashSale !== null);
          if (flashSaleItems.length > 0) {
            setProducts(flashSaleItems);
            const endDates = flashSaleItems.map(p => new Date(p.flashSale.endDate).getTime());
            if (endDates.length > 0) setCountDownTarget(new Date(Math.min(...endDates)));
          }
        }
      } catch (error) { console.error("Lỗi Flash Sale:", error); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setSlidesToShow(1.2); 
      else if (width < 1024) setSlidesToShow(3); 
      else if (width < 1280) setSlidesToShow(4); 
      else setSlidesToShow(5); 
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logic chuyển slide
  const nextSlide = useCallback(() => {
    if (products.length <= slidesToShow) return;
    setCurrentIndex((prev) => (prev >= products.length - Math.floor(slidesToShow) ? 0 : prev + 1));
  }, [products.length, slidesToShow]);

  const prevSlide = useCallback(() => {
    if (products.length <= slidesToShow) return;
    setCurrentIndex((prev) => (prev <= 0 ? products.length - Math.floor(slidesToShow) : prev - 1));
  }, [products.length, slidesToShow]);

  // Hàm reset timer
  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    // Chỉ chạy auto play nếu đủ số lượng sản phẩm
    if (products.length > slidesToShow) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
  }, [nextSlide, products.length, slidesToShow]);

  // Khởi chạy timer ban đầu
  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [resetAutoPlay]);

  // Các hàm xử lý click thủ công
  const handleNextClick = () => {
    nextSlide();
    resetAutoPlay();
  };

  const handlePrevClick = () => {
    prevSlide();
    resetAutoPlay();
  };

  const handleMouseEnter = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseLeave = () => {
    resetAutoPlay();
  };

  if (!products || products.length === 0) return null;
  const canNavigate = products.length > slidesToShow;

  return (
    <div className="w-full max-w-[1350px] mx-auto px-4 my-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-t-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
           <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm"><TrendingIcon className="text-white text-2xl animate-pulse" /></div>
           <div>
               <div className="flex items-center gap-2"><h2 className="text-xl md:text-2xl font-bold text-white uppercase italic tracking-wide">FLASH SALE</h2><FireIcon className="text-yellow-300 animate-bounce" /></div>
               <p className="text-white/80 text-xs font-medium">Kết thúc sau</p>
           </div>
           {countDownTarget && <Countdown targetDate={countDownTarget} />}
        </div>
        <Link to="/products?flash_sale=true" className="z-10 bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-lg active:scale-95 flex items-center gap-1">
            Xem tất cả <ChevronRightIcon fontSize="small" />
        </Link>
      </div>

      {/* Body Carousel */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl p-4 sm:p-6 relative shadow-sm" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        
        {/* Nút Prev - Dùng handlePrevClick */}
        {canNavigate && (
            <button 
                onClick={handlePrevClick} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 bg-white border border-gray-200 text-gray-700 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 disabled:opacity-0"
                disabled={currentIndex === 0}
            >
                <ChevronLeftIcon />
            </button>
        )}

        <div className="overflow-hidden py-2 -mx-2"> 
             <div 
                className="flex transition-transform duration-500 ease-out will-change-transform" 
                style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}
             >
                {products.map((product) => {
                  const priceInfo = calculateItemFinalPrice(product);
                  
                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 px-3"
                      style={{ width: `${100 / slidesToShow}%` }}
                    >
                      <ProductCard
                        {...product}
                        isFlashSaleView = {true}
                        finalPrice={priceInfo.finalPrice}
                        discountPercent={priceInfo.discountPercent}
                        isFlashSaleActive={priceInfo.isFlashSale}
                        initialIsFavorite={wishlistIds.includes(product.id)}
                        onRemoveSuccess={handleRemoveFromWishlist}
                      />
                    </div>
                  );
                })}

             </div>
        </div>

        {/* Nút Next - Dùng handleNextClick */}
        {canNavigate && (
            <button 
                onClick={handleNextClick} 
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 bg-white border border-gray-200 text-gray-700 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
            >
                <ChevronRightIcon />
            </button>
        )}
      </div>
    </div>
  );
};