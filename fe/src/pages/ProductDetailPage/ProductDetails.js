import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

// --- Components ---
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Rating from "../../components/Rating/Rating";
import SectionHeading from "../../components/SectionsHeading/SectionHeading";
import ProductCard from "../ProductListPage/ProductCard";
import { showCustomToast } from '../../components/Toaster/ShowCustomToast';
import { calculateItemFinalPrice } from "../../utils/price-util";

// --- API & Actions ---
import { getAllProducts } from "../../api/fetch/fetchProducts";
import { addItemToCartAction } from "../../store/actions/cartAction";
import { getReviewsByProductId, addReview } from "../../api/fetch/fetchReviews";
import { addToViewedHistory } from "../../utils/history-util";
import { trackProductView } from "../../api/apiRecommend";
import { addToWishlist, removeFromWishlist } from "../../api/product/wishlist";

import { selectUserInfo } from "../../store/features/user";
import { getWishlistByUser } from "../../api/product/wishlist";
import { getToken } from "../../utils/jwt-helper";

// --- Icons & Assets ---
import {
  AddShoppingCart as AddShoppingCartIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  AssignmentReturn as ReturnIcon,
  CreditCard as CreditCardIcon,
  Share as ShareIcon,
  Star as StarIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';
import pictureDF from "../../assets/img/pictureDF.png";

// =========================================================================
// 1. SUB-COMPONENT: ĐẾM NGƯỢC (COUNTDOWN TIMER)
// =========================================================================
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft("Đã kết thúc");
        return false; 
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Format số 0 ở đầu (05s thay vì 5s)
      const f = (n) => n.toString().padStart(2, '0');
      setTimeLeft(`${days}d : ${f(hours)}h : ${f(minutes)}m : ${f(seconds)}s`);
      return true;
    };

    if (!calculateTimeLeft()) return;

    const interval = setInterval(() => {
      if (!calculateTimeLeft()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono font-bold text-base sm:text-lg tracking-widest">{timeLeft}</span>;
};

// =========================================================================
// 2. SUB-COMPONENT: COMMENT ITEM
// =========================================================================

const CommentItem = ({ comment, onReply, activeReplyId, submitReply, cancelReply, currentUser, rootUserId }) => {
  
  // 1. TRÍCH XUẤT DỮ LIỆU CƠ BẢN
  const commentUser = comment.user || {};
  const commentUserId = commentUser.id || comment.userId;
  
  // 2. XÁC ĐỊNH "CHỦ THREAD" (Người viết review gốc)
  // Nếu không có rootUserId truyền từ trên xuống (là cấp 1), thì chính người viết comment này là chủ thread
  const threadOwnerId = rootUserId || ((!comment.parentId) ? commentUserId : null);

  // 3. XÁC ĐỊNH QUYỀN HẠN (Đã bỏ isCommentWriter)
  // - Là Admin
  const isAdmin = currentUser?.authorityList?.some(role => role.authority === "ADMIN" || role.roleCode === "ADMIN");
  
  // - Là chủ của bài review gốc
  const isThreadOwner = currentUser?.id === threadOwnerId;

  // Điều kiện hiển thị nút Reply: Chỉ Admin HOẶC Chủ bài review gốc mới được trả lời
  const canReply = currentUser && (isAdmin || isThreadOwner);

  // --- LOGIC HIỂN THỊ ---
  const fullName = `${commentUser.firstName || ''} ${commentUser.lastName || ''}`.trim();
  const displayName = fullName || commentUser.userName || "Người dùng ẩn danh";

  const [expanded, setExpanded] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const getAvatarInitial = () => {
    if (commentUser.firstName) return commentUser.firstName.charAt(0).toUpperCase();
    if (commentUser.lastName) return commentUser.lastName.charAt(0).toUpperCase();
    return "U";
  };

  const UserAvatar = ({ size = "w-10 h-10", textSize = "text-xl" }) => {
    const [imageError, setImageError] = useState(false);
    const avatarUrl = commentUser.avatarUrl;
    
    if (avatarUrl && !imageError) {
      return (
        <img src={avatarUrl} alt={displayName} className={`${size} rounded-full object-cover border border-gray-200`} onError={() => setImageError(true)} />
      );
    }
    
    // Mặc định màu xám cho tất cả (vì đã bỏ logic phân biệt người viết)
    return (
      <div className={`${size} rounded-full bg-gray-100 text-gray-600 flex items-center justify-center border border-transparent select-none`}>
        <span className={`${textSize} font-bold`}>{getAvatarInitial()}</span>
      </div>
    );
  };

  useEffect(() => {
    if (activeReplyId === comment.id) {
        setReplyContent(`@${displayName} `);
    }
  }, [activeReplyId, displayName, comment.id]);

  // --- Render đệ quy ---
  const renderReplies = (replies) => {
    return replies.map((reply) => (
      <CommentItem
        key={reply.id}
        comment={reply}
        onReply={onReply}
        activeReplyId={activeReplyId}
        submitReply={submitReply}
        cancelReply={cancelReply}
        currentUser={currentUser}
        rootUserId={threadOwnerId} // Vẫn cần truyền cái này để xác định chủ bài viết ở cấp con
      />
    ));
  };

  return (
    <div className={`flex flex-col ${comment.parentId ? 'ml-8 sm:ml-12 mt-4 border-l-2 border-gray-100 pl-4 bg-gray-50/50 rounded-r-lg p-2' : 'border-b border-gray-100 py-6 last:border-0'}`}>
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="flex-shrink-0">
             <UserAvatar size={comment.parentId ? "w-8 h-8" : "w-10 h-10"} textSize={comment.parentId ? "text-xs" : "text-base"} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                {displayName}
                
                {/* Chỉ giữ lại badge Tác giả (Chủ bài review) */}
                {commentUserId === threadOwnerId && !comment.parentId && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Tác giả</span>}
                
                {/* Badge Phản hồi */}
                {comment.parentId && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Phản hồi</span>}
            </h4>
            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          
          {!comment.parentId && comment.rating > 0 && (
            <div className="flex items-center mb-2 text-yellow-400 text-sm">{'★'.repeat(comment.rating)}</div>
          )}
          
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
          
          {/* NÚT REPLY */}
          {canReply && (
            <div className="mt-2">
                <button onClick={() => onReply(comment)} className="text-xs font-medium text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors">
                 <span>Trả lời</span>
                </button>
            </div>
          )}

          {activeReplyId === comment.id && (
            <div className="mt-3 animate-fadeIn">
                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm" autoFocus />
                <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={cancelReply} className="px-3 py-1.5 text-xs bg-gray-100 rounded-md">Hủy</button>
                  <button onClick={() => submitReply(comment.id, replyContent)} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md">Gửi</button>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDER REPLIES */}
      {comment.replies && comment.replies.length > 0 && (
      <div className="mt-2 space-y-2">
        {!expanded && (
          <>
            {comment.replies.slice(0, 1).map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                activeReplyId={activeReplyId}
                submitReply={submitReply}
                cancelReply={cancelReply}
                currentUser={currentUser}
                rootUserId={threadOwnerId}
              />
            ))}
          </>
        )}
        {expanded && <>{renderReplies(comment.replies)}</>}
        
        {!expanded && comment.replies.length > 1 && (
          <div className="flex justify-end">
            <button onClick={() => setExpanded(true)} className="text-xs text-blue-600 hover:underline">Xem thêm {comment.replies.length - 1} phản hồi</button>
          </div>
        )}
      </div>
    )}
    </div>
  );
};

// =========================================================================
// 4. MAIN COMPONENT: PRODUCT DETAILS
// =========================================================================
const ProductDetails = () => {
  const { product } = useLoaderData();
  const dispatch = useDispatch();

  // --- Selectors ---
  const currentUser = useSelector((state) => state.userState?.userInfo);

  // --- States ---
  const [selectedImage, setSelectedImage] = useState(product?.thumbnail || "");
  const [breadCrumbLinks, setBreadCrumbLink] = useState([]);
  const [similarProduct, setSimilarProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [visibleRootCount, setVisibleRootCount] = useState(2);
  const rootReviews = reviews.filter(r => !r.parentId);
  const visibleReviews = rootReviews.slice(0, visibleRootCount);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]); 
    }
  }, [product]);

  // --- Logic tính toán Tồn Kho ---
  const currentStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.stockQuantity;
    return product?.stock || 0;
  }, [product, selectedVariant]);

  // --- Logic tính toán giá & Flash Sale ---
  const { isFlashSale, finalPrice, originalPrice, discountPercent, savedAmount, soldPercent, soldQty, totalQty } = useMemo(() => {
    const now = new Date();
    // Check Flash Sale validity
    const isFS = product?.flashSale && new Date(product.flashSale.endDate) > now && new Date(product.flashSale.startDate) <= now;
    
    let basePrice = selectedVariant ? selectedVariant.price : (product?.price || 0);

    let finalP = basePrice;
    let percent = 0;

    if (isFS) {
        percent = product.flashSale.discountPercent;
        finalP = basePrice * (1 - percent / 100);
    } else {
        percent = product?.discount || 0;
        finalP = basePrice * (1 - percent / 100);
    }

    // Logic Progress Bar
    let sQty = 0, tQty = 1;
    if (isFS) {
        sQty = product.flashSale.sold || 0;
        tQty = product.flashSale.quantity || 1;
    }
    const sPercent = Math.min((sQty / tQty) * 100, 100);

    return {
        isFlashSale: isFS,
        originalPrice: basePrice,
        finalPrice: Math.round(finalP),
        discountPercent: Math.round(percent),
        savedAmount: basePrice - Math.round(finalP),
        soldPercent: sPercent,
        soldQty: sQty,
        totalQty: tQty
    };
  }, [product, selectedVariant]);
  const productCategory = product?.category;
  const productType = product?.categoryType;

  const features = [
    { icon: <ShippingIcon className="w-5 h-5" />, label: "Miễn phí vận chuyển", description: "Đơn từ 500k" },
    { icon: <ReturnIcon className="w-5 h-5" />, label: "Đổi trả 30 ngày", description: "Lỗi 1 đổi 1" },
    { icon: <SecurityIcon className="w-5 h-5" />, label: "Bảo hành chính hãng", description: "24 tháng" },
    { icon: <CreditCardIcon className="w-5 h-5" />, label: "Thanh toán an toàn", description: "Đa dạng hình thức" }
  ];

  const normalizedSpecs = (product?.specifications || []).map(spec => ({
    name: spec?.name?.trim() || "Đang cập nhật",
    value: spec?.value?.trim() || "—"
  }));

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]); 
    }
  }, [product]);

  useEffect(() => {
    const categoryId = product?.category?.id; 
    const typeId = product?.categoryType?.id;

    if (categoryId && typeId) {
      getAllProducts(categoryId, typeId)
        .then((res) => {
          setSimilarProducts(res?.filter((item) => item?.id !== product?.id) || []);
        })
        .catch((err) => {
          setSimilarProducts([]);
        });
    }
  }, [product]);

  useEffect(() => {
    setBreadCrumbLink([
      { title: "Trang chủ", path: "/" },
      productCategory && { title: productCategory.name, path: `/products` }, 
      productType && { title: productType.name, path: `/products` },
      { title: product?.name, path: window.location.pathname } 
    ].filter(Boolean));
  }, [productCategory, productType, product]);

  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    try { 
        const res = await getReviewsByProductId(product.id);
        setReviews(res || []);
    } catch { 
        showCustomToast("Không thể tải đánh giá", "error"); 
    } finally { 
        setIsLoadingReviews(false); 
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
    window.scrollTo(0, 0);
    setSelectedImage(product?.thumbnail || ""); 
    
    if (product?.id) {
        addToViewedHistory(product.id);
        if (currentUser?.id) {
            trackProductView(product.id, currentUser.id);
        }
    }
  }, [fetchReviews, product, currentUser]);

  const addItemToCart = useCallback(() => {
    if (!product) return;
    if (currentStock <= 0) {
        showCustomToast("Sản phẩm tạm hết hàng!", "warning");
        return;
    }
    if (isFlashSale && soldQty >= totalQty) {
        showCustomToast("Chương trình Flash Sale đã hết suất, vui lòng mua giá thường!", "error");
        return;
    }
    const variantPayload = selectedVariant ? [selectedVariant] : [];

    dispatch(addItemToCartAction({
        productId: product.id,
        thumbnail: product.thumbnail,
        name: product.name,
        variant: variantPayload, 
        quantity: quantity,
        subTotal: finalPrice * quantity, 
        price: finalPrice,
      })
    );
    showCustomToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, "success");
  }, [dispatch, product, quantity, finalPrice, isFlashSale, soldQty, totalQty, currentStock, selectedVariant]);

  const onRemoveSuccess = (productId) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
  };

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
        await addToWishlist(userEmail, product.id);
        setIsFavorite(true);
        showCustomToast("Đã thêm vào yêu thích ❤️", "success");
      } else {
        await removeFromWishlist(userEmail, product.id);
        setIsFavorite(false);
        showCustomToast("Đã xóa khỏi yêu thích 💔", "success");
        
        if (onRemoveSuccess) {
            onRemoveSuccess(product.id);
        }
      }
    } catch (error) {
      showCustomToast("Lỗi cập nhật yêu thích!", "error");
    }
  };

  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    showCustomToast('Đã sao chép liên kết sản phẩm', "success");
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Xử lý gửi phản hồi (Reply)
  const handleSubmitReply = async (parentId, content) => {
    if (!content.trim()) {
        showCustomToast("Nội dung không được để trống", "warning");
        return;
    }
    if (!currentUser) {
        showCustomToast("Vui lòng đăng nhập để trả lời", "info");
        return;
    }

    try {
        const reviewData = {
            productId: product.id,
            content: content,
            rating: 0, 
            parentId: parentId,
            userId: currentUser.id
        };
        
        await addReview(reviewData); 
        showCustomToast("Đã gửi phản hồi thành công", "success");
        setActiveReplyId(null);
        fetchReviews();
    } catch (error) {
        console.error(error);
        showCustomToast("Gửi phản hồi thất bại, thử lại sau", "error");
    }
  };

  const handleReplyClick = (comment) => setActiveReplyId(comment.id);
  const handleCancelReply = () => setActiveReplyId(null);

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

  // --- Guard Clause ---
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500"><h2 className="text-xl">Không tìm thấy sản phẩm</h2></div>;

  // --- JSX ---
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            
            {/* --- LEFT: IMAGES --- */}
            <div className="space-y-4">
              <div className={`bg-gray-50 rounded-xl p-4 flex items-center justify-center h-[400px] relative group border ${isFlashSale ? 'border-orange-200' : 'border-transparent'}`}>
                <img
                  src={selectedImage}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  alt={product?.name}
                  onError={(e) => { e.target.src = pictureDF; }}
                />
                
                {/* Badges */}
                {isFlashSale ? (
                    <div className="absolute top-4 left-4 z-10 animate-pulse">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1.5 rounded-br-xl rounded-tl-xl text-sm font-bold shadow-lg flex items-center gap-1">
                            <FlashOnIcon style={{fontSize: 20}}/>
                            <span>FLASH SALE -{discountPercent}%</span>
                        </div>
                    </div>
                ) : (
                    discountPercent > 0 && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-md z-10">
                            -{discountPercent}%
                        </span>
                    )
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {product?.resources?.map((item, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedImage(item?.url)} 
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 p-1 transition-all duration-200 ${selectedImage === item.url ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={item?.url} className="w-full h-full object-contain rounded-md" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* --- RIGHT: INFO --- */}
            <div className="flex flex-col min-w-0 h-full">
              <Breadcrumb links={breadCrumbLinks} />
              
              <div className="mt-4">
                <h1
                  className="text-lg lg:text-xl font-bold text-gray-900 leading-snug max-w-full line-clamp-2"
                  title={product?.name}
                >
                  {product?.name}
                </h1>

                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Rating rating={product?.rating} />
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">{product.reviewCount || reviews.length} đánh giá</span>
                  <span className="text-gray-300">|</span>
                  <span className={`text-sm font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {currentStock > 0 ? `Còn hàng` : 'Liên hệ'}
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="mt-4 mb-4">
                {isFlashSale ? (
                  <div className="rounded-lg overflow-hidden border border-orange-100">
                    {/* Header Flash Sale */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 flex justify-between items-center">
                      <div className="flex items-center gap-1 font-semibold text-xs">
                        <FlashOnIcon style={{ fontSize: 16 }} />
                        <span>FLASH SALE</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
                        <span className="text-[10px] uppercase font-medium opacity-90">Kết thúc</span>
                        <CountdownTimer targetDate={product.flashSale.endDate} />
                      </div>
                    </div>

                    {/* Body Flash Sale */}
                    <div className="bg-orange-50 p-3">
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-red-600">
                          {finalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                        <span className="text-sm text-gray-400 line-through mb-0.5">
                          {originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                      </div>

                      {/* Sold Progress */}
                      <div className="max-w-[180px]">
                        <div className="flex justify-between text-[10px] text-red-600 font-semibold mb-0.5 uppercase">
                          <span>Đã bán: {soldQty}</span>
                          <span>{Math.round(soldPercent)}%</span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-end flex-wrap gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {finalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </span>
                      {discountPercent > 0 && (
                        <>
                          <span className="text-sm text-gray-400 line-through font-medium mb-0.5">
                            {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                          </span>
                          <span className="mb-1 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                            Tiết kiệm {savedAmount.toLocaleString('vi-VN')}đ
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Brand & Variations */}
              <div className="mb-4 space-y-3">

                {/* --- BRAND --- */}
                {product.brand && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">Thương hiệu:</span>
                    <span
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium truncate max-w-[160px]"
                      title={product.brand.name}
                    >
                      {product.brand.name}
                    </span>
                  </div>
                )}

                {/* --- VARIANTS --- */}
                {product?.variants?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      Cấu hình:
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => {
                        const isActive = selectedVariant?.id === variant.id;
                        // Kiểm tra stock của từng nút để làm mờ nếu hết hàng
                        const isOutOfStock = variant.stockQuantity <= 0;

                        return (
                          <button
                            key={variant.id}
                            onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                            disabled={isOutOfStock}
                            className={`
                              px-3 py-2 rounded-lg border text-xs font-medium transition flex flex-col items-start
                              ${isActive 
                                ? "border-blue-600 bg-blue-50 text-blue-600" 
                                : isOutOfStock
                                    ? "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                    : "border-gray-200 text-gray-700 hover:border-blue-400 bg-white"
                              }
                            `}
                          >
                            <span className="font-bold">
                                {variant.attributes?.CPU || ""} {variant.attributes?.Ram ? `/ ${variant.attributes.Ram}` : ""} {variant.attributes?.SSD ? `/ ${variant.attributes.SSD}` : ""}
                            </span>
                            {/* Hiển thị giá riêng của variant để user dễ so sánh */}
                            <span className={`text-[10px] mt-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                                {variant.price.toLocaleString('vi-VN')}₫
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-700">Số lượng:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                      <button onClick={decrementQuantity} className="w-10 h-10 hover:bg-gray-100 rounded-l-lg transition">-</button>
                      <span className="w-12 text-center font-medium border-x border-gray-300 py-2">{quantity}</span>
                      <button onClick={incrementQuantity} className="w-10 h-10 hover:bg-gray-100 rounded-r-lg transition">+</button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={addItemToCart} 
                    disabled={currentStock <= 0} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all transform hover:-translate-y-0.5"
                  >
                    <AddShoppingCartIcon /> 
                    <span>{currentStock > 0 ? 'Thêm vào giỏ hàng' : 'Liên hệ'}</span>
                  </button>
                  <div className="flex space-x-2">
                    <button 
                        onClick={toggleFavorite} 
                        className={`p-3.5 rounded-xl border transition-colors ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}
                        title="Yêu thích"
                    >
                        {isFavorite ? <FavoriteFilledIcon /> : <FavoriteIcon />}
                    </button>
                    <button onClick={shareProduct} className="p-3.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors" title="Chia sẻ">
                        <ShareIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8 bg-gray-50 p-4 rounded-xl">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="text-blue-600 mt-0.5">{f.icon}</div>
                    <div>
                        <p className="font-bold text-sm text-gray-800">{f.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- DESCRIPTION --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 p-6 lg:p-8">
          <SectionHeading title="Mô tả sản phẩm" />
          <div
            className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-4 cursor-pointer"
            title={product?.description}
          >
            {product?.description}
          </div>
        </div>

        {/* --- SPECIFICATIONS --- */}
        {normalizedSpecs?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 mt-6">
            <SectionHeading title="Thông số kỹ thuật" />

            <div className="divide-y divide-gray-100">
              {normalizedSpecs.map((spec, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 py-2">
                  {/* Tên thông số */}
                  <div
                    className="text-sm text-gray-500 font-medium truncate"
                    title={spec.name}
                  >
                    {spec.name}
                  </div>

                  {/* Giá trị thông số */}
                  <div
                    className="col-span-2 text-sm text-gray-800 line-clamp-2 min-w-0"
                    title={spec.value}
                  >
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* --- REVIEWS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 p-6 lg:p-8" id="reviews-section">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <SectionHeading title="Đánh giá & Nhận xét" />
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 flex items-center justify-end gap-2">
                        {product.rating?.toFixed(1) || 0} <StarIcon className="text-yellow-400" style={{fontSize: 32}}/>
                    </div>
                    <div className="text-sm text-gray-500">{product.reviewCount || reviews.length} đánh giá</div>
                </div>
            </div>
            
            {isLoadingReviews ? (
              <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.length > 0 ? (
                      visibleReviews.map((review) => (
                          <CommentItem 
                              key={review.id} 
                              comment={review} 
                              onReply={handleReplyClick} 
                              activeReplyId={activeReplyId} 
                              submitReply={handleSubmitReply} 
                              cancelReply={handleCancelReply} 
                              currentUser={currentUser} 
                              rootUserId={review.userId}
                          />
                      ))
                  ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <StarIcon className="text-gray-300 text-5xl mb-3" />
                          <p className="text-gray-500 font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
                          <p className="text-sm text-gray-400">Hãy là người đầu tiên chia sẻ cảm nhận!</p>
                      </div>
                  )}

                  {rootReviews.length > visibleRootCount && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setVisibleRootCount(prev => prev + 2)}
                        className="px-6 py-2 rounded-xl border border-gray-300 text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        Xem thêm đánh giá
                      </button>
                    </div>
                  )}
              </div>
            )}
        </div>

        {/* --- SIMILAR PRODUCTS --- */}
        {similarProduct.length > 0 && (
          <div className="mt-8">
            <SectionHeading title="Sản phẩm tương tự" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {similarProduct.slice(0, 4).map((item, index) => {
                  const { finalPrice, discountPercent, isFlashSale } = calculateItemFinalPrice(item);

                  return (
                    <ProductCard 
                      key={item.id || index} 
                      {...item} 
                      finalPrice={finalPrice}
                      discountPercent={discountPercent}
                      isFlashSaleActive={isFlashSale}
                      isFlashSaleView={false} 
                      initialIsFavorite={wishlistIds.includes(item.id)}
                      onRemoveSuccess={handleRemoveFromWishlist}
                    />
                  );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;