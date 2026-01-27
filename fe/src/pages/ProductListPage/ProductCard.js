import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Rating from '../../components/Rating/Rating';
import { addToWishlist, removeFromWishlist } from "../../api/product/wishlist";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../utils/jwt-helper";
import {
  AddShoppingCart as AddShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  NewReleases as NewIcon,
  Verified as VerifiedIcon,
  LocalFireDepartment as FireIcon,
  FlashOn as FlashOnIcon
} from '@mui/icons-material';
import { addItemToCartAction } from "../../store/actions/cartAction";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";

const ProductCard = ({
  id,
  name,
  price,          // Giá gốc của Product
  finalPrice,     // Giá Flash Sale (nếu có)
  discountPercent = 0, // % Giảm giá thường
  isFlashSaleActive = false,
  rating = 0,
  reviewCount,
  thumbnail,
  slug,
  brand,
  variants,
  stock,
  newArrival = false,
  resources = [],
  flashSale,
  isFlashSaleView = false,
  initialIsFavorite = false,
  onRemoveSuccess,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);
  
  const inStock = stock > 0;
  
  const selectedVariant = useMemo(() => {
    return Array.isArray(variants) && variants.length > 0 ? variants[0] : (variants || null);
  }, [variants]);

  const displayOriginalPrice = useMemo(() => {
      return (selectedVariant && selectedVariant.price) ? selectedVariant.price : price;
  }, [selectedVariant, price]);

  const displayFinalPrice = useMemo(() => {
    if (isFlashSaleActive) {
      return finalPrice; 
    }
    if (discountPercent > 0) {
      return displayOriginalPrice * (1 - discountPercent / 100); 
    }
    return displayOriginalPrice; 
  }, [isFlashSaleActive, finalPrice, displayOriginalPrice, discountPercent]);

  const displayDiscountPercent = useMemo(() => {
      if (isFlashSaleActive && displayOriginalPrice > 0) {
          return Math.round(((displayOriginalPrice - displayFinalPrice) / displayOriginalPrice) * 100);
      }
      return discountPercent;
  }, [isFlashSaleActive, displayOriginalPrice, displayFinalPrice, discountPercent]);

  const getPrimaryImage = () => {
    const primaryResource = resources?.find(resource => resource.isPrimary);
    return primaryResource?.url || thumbnail;
  };
  const displayImage = getPrimaryImage();
  const showFireBar = isFlashSaleView && flashSale;

  const soldQty = flashSale?.sold || 0;
  const totalQty = flashSale?.quantity || 1;
  const soldPercent = totalQty > 0 ? Math.min((soldQty / totalQty) * 100, 100) : 0;

  const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  // --- HANDLERS ---
  const addItemToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      showCustomToast('Vui lòng liên hệ cửa hàng', 'error');
      return;
    }

    const variantPayload = selectedVariant ? [selectedVariant] : [];

    dispatch(addItemToCartAction({
      productId: id,
      thumbnail: displayImage,
      name,
      variant: variantPayload,
      quantity: 1,
      subTotal: displayFinalPrice, 
      price: displayFinalPrice,
    }));

    showCustomToast('Đã thêm vào giỏ hàng', 'success');
  }, [dispatch, id, displayImage, name, inStock, displayFinalPrice, selectedVariant]);

  const toggleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const token = getToken();

    if (!token) {
      showCustomToast("Bạn cần đăng nhập để thêm vào yêu thích ❤️", "error");
      return;
    }

    try {
      const decoded = jwtDecode(token); const userEmail = decoded?.id || decoded?.sub;
      if (!isFavorite) {
        await addToWishlist(userEmail, id);
        setIsFavorite(true);
        showCustomToast("Đã thêm vào yêu thích ❤️", "success");
      } else {
        await removeFromWishlist(userEmail, id);
        setIsFavorite(false);
        showCustomToast("Đã xóa khỏi yêu thích 💔", "success");
        
        if (onRemoveSuccess) {
            onRemoveSuccess(id);
        }
      }
    } catch (error) {
      showCustomToast("Lỗi cập nhật yêu thích!", "error");
    }
  };

  const handleCardClick = () => { navigate(`/product/${slug}`); };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-300 h-full overflow-hidden cursor-pointer
        ${!inStock ? 'opacity-70 pointer-events-none' : ''} 
        ${isFlashSaleActive ? 'border-orange-300 hover:shadow-[0_0_15px_rgba(255,165,0,0.3)]' : 'border-gray-200 hover:shadow-xl'}
      `}
    >
      {/* 1. IMAGE AREA */}
      <div className="relative aspect-square w-full bg-white p-4 overflow-hidden border-b border-gray-100">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {/* --- BADGES --- */}
        <div className="absolute top-0 left-0 w-full p-2 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {isFlashSaleActive && (
             <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-lg shadow-md flex items-center gap-1 animate-pulse border border-white/30">
                <FlashOnIcon style={{ fontSize: 12 }} /> FLASH SALE
             </div>
          )}

          {newArrival && !isFlashSaleActive && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
              <NewIcon sx={{ fontSize: 12 }} /> MỚI
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all z-20 pointer-events-auto
            ${isFavorite ? 'bg-red-50 text-red-500 opacity-100' : 'bg-white/80 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}
          `}
          title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
        >
          {isFavorite ? <FavoriteIcon fontSize="small"/> : <FavoriteBorderIcon fontSize="small"/>}
        </button>
      </div>

      {/* 2. PRODUCT INFO */}
      <div className="p-3 flex flex-col flex-1">
        {brand?.name && (
          <div className="mb-2 flex">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-colors">
              <VerifiedIcon sx={{ fontSize: 12 }} className="text-blue-500" />
              {brand.name}
            </span>
          </div>
        )}

        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px] leading-snug group-hover:text-blue-600 transition-colors mb-1" title={name}>
          {name}
        </h3>

        <div className="mb-3 min-h-[20px]">
          {showFireBar ? (
            <div className="relative w-full bg-red-100 rounded-full h-3 border border-red-200 overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000" style={{ width: `${soldPercent}%` }}></div>
               <div className="absolute inset-0 flex items-center justify-center z-10">
                   <span className="text-[9px] font-bold text-white uppercase drop-shadow-sm tracking-wider leading-none">Đã bán {soldQty}</span>
               </div>
               <div className="absolute top-0 left-0 bottom-0 flex items-center z-10 pl-0.5">
                 <FireIcon className="text-yellow-200 animate-pulse" style={{ fontSize: 10 }} />
               </div>
            </div>
          ) : (
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                   <Rating rating={rating} size="small" />
                   <span className="text-[10px] text-gray-400">({reviewCount})</span>
                </div>
                {isFlashSaleActive && (
                    <span className="text-[10px] font-bold text-orange-600 flex items-center animate-pulse">
                        <FlashOnIcon style={{ fontSize: 11 }} /> Đang giảm sốc
                    </span>
                )}
             </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-dashed border-gray-100 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
               <span className={`font-bold text-base ${isFlashSaleActive ? 'text-orange-600' : 'text-red-600'}`}>
                  {formatPrice(displayFinalPrice)}
                </span>
               {isFlashSaleActive && <FlashOnIcon className="text-orange-500" style={{ fontSize: 14 }} />}
            </div>

            {displayDiscountPercent > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-gray-400 text-[10px] line-through">
                  {formatPrice(displayOriginalPrice)}
                </span>
                <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1 rounded">
                  -{displayDiscountPercent}%
                </span>
              </div>
            )}
          </div>

          <button
            onClick={addItemToCart}
            disabled={!inStock}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm z-20 pointer-events-auto
              ${inStock 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-blue-100' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            title="Thêm vào giỏ"
          >
            <AddShoppingCartIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {!inStock && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center cursor-not-allowed">
          <span className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded uppercase tracking-wider shadow-lg transform -rotate-12 border-2 border-white">
            LIÊN HỆ
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;