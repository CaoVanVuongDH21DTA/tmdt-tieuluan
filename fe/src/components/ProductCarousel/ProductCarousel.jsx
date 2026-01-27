import { useEffect, useState, useRef, useCallback } from "react";
import SectionHeading from "../SectionsHeading/SectionHeading";
import { getProductsByIds } from "../../api/product/product"; 
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import ProductCard from "../../pages/ProductListPage/ProductCard"; 
import { calculateItemFinalPrice } from "../../utils/price-util";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../../store/features/user";
import { getWishlistByUser } from "../../api/product/wishlist";

export const ProductCarousel = ({ title, icon, fetchIdsFunction, limit = 8, initialProducts = null }) => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4); 
  const autoPlayRef = useRef(null);
  const containerRef = useRef(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const userInfo = useSelector(selectUserInfo);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userInfo?.id) {
        setWishlistIds([]);
        return;
      }

      try {
        const data = await getWishlistByUser(userInfo.id);
        if (Array.isArray(data)) {
          setWishlistIds(
            data
              .map(item => item.product?.id)
              .filter(Boolean)
          );
        }
      } catch (err) {
        setWishlistIds([]);
      }
    };

    fetchWishlist();
  }, [userInfo?.id]);

  const handleRemoveFromWishlist = (productId) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
  };


  useEffect(() => {
    const loadProducts = async () => {
      if (initialProducts && initialProducts.length > 0) {
        setProducts(initialProducts);
        return;
      }

      if (fetchIdsFunction) {
        try {
          const ids = await fetchIdsFunction(limit);
          if (ids && ids.length > 0) {
            const fullProducts = await getProductsByIds(ids);
            const sortedProducts = ids.map(id => fullProducts.find(p => p.id === id)).filter(p => p !== undefined);
            setProducts(sortedProducts);
          } else { 
            setProducts([]); 
          }
        } catch (error) { 
          setProducts([]); 
        }
      }
    };
    loadProducts();
  }, [fetchIdsFunction, limit, initialProducts]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setSlidesToShow(1.2);
      else if (width < 768) setSlidesToShow(2);
      else if (width < 1024) setSlidesToShow(3);
      else setSlidesToShow(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (products.length <= slidesToShow) return;
    setCurrentIndex((prev) => (prev >= products.length - slidesToShow ? 0 : prev + 1));
  }, [products.length, slidesToShow]);

  const prevSlide = useCallback(() => {
    if (products.length <= slidesToShow) return;
    setCurrentIndex((prev) => (prev <= 0 ? products.length - slidesToShow : prev - 1));
  }, [products.length, slidesToShow]);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (products.length > slidesToShow) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    }
  }, [nextSlide, products.length, slidesToShow]);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [resetAutoPlay]); 

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

  if (products.length === 0) return null;
  const canNavigate = products.length > slidesToShow;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            {icon}
          </div>
          <SectionHeading title={title} />
        </div>
        {canNavigate && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevClick} 
              className="bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-500 text-gray-500 rounded-full w-9 h-9 flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50" 
              disabled={currentIndex === 0}
            >
              <ChevronLeftIcon fontSize="small" />
            </button>

            <button 
              onClick={handleNextClick} 
              className="bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-500 text-gray-500 rounded-full w-9 h-9 flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50" 
              disabled={currentIndex >= products.length - slidesToShow}
            >
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={containerRef}>
        <div className="flex transition-transform duration-500 ease-out will-change-transform" style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}>
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
    </div>
  );
};