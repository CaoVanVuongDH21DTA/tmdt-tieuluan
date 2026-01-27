import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Search,
} from '@mui/icons-material';
import { useDispatch, useSelector } from "react-redux";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { getWishlistByUser } from '../../api/product/wishlist';
import { selectUserInfo } from '../../store/features/user';
import { addItemToCartAction } from "../../store/actions/cartAction"; 
import { calculateItemFinalPrice } from '../../utils/price-util';
import ProductCard from '../ProductListPage/ProductCard';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();

  // 1. Fetch Data
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!userInfo?.id) {
          showCustomToast("Không tìm thấy thông tin người dùng", "warning");
          setLoading(false);
          return;
        }

        const data = await getWishlistByUser(userInfo.id);
          if (data && Array.isArray(data)) {
            const mapped = data.map(item => {
              // 1. Lấy giá trị an toàn
              const originalPrice = item.product?.price || 0;
              const discountVal = item.product?.discount || 0;

              // 2. Tính toán finalPrice ngay tại đây
              const calculatedFinalPrice = originalPrice * (1 - discountVal / 100);

              return {
                id: item.product?.id, 
                wishlistId: item.id,  
                name: item.product?.name,
                price: originalPrice,
                discountPercent: discountVal, 
                finalPrice: calculatedFinalPrice, 
                thumbnail: item.product?.thumbnail,
                slug: item.product?.slug,
                category: item.product?.category?.code || 'unknown',
                stock: item.product?.stock || 0,
                rating: item.product?.rating || 0,
                reviewCount: item.product?.reviewCount || 0,
                addedDate: item.createdAt,
                brand: item.product?.brand, 
                resources: [{ isPrimary: true, url: item.product?.thumbnail }],
                flashSale: item.product?.flashSale || null,
                variants: item.product?.variants || [],
              };
            });
            
            setWishlistItems(mapped);
            setFilteredItems(mapped);
          }
      } catch (err) {
        showCustomToast("Không thể tải danh sách yêu thích", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userInfo?.id]);
  
  // 2. Filter & Sort logic
  useEffect(() => {
    let filtered = wishlistItems.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedDate) - new Date(a.addedDate);
        case 'oldest':
          return new Date(a.addedDate) - new Date(b.addedDate);
        case 'price-low':
          return a.finalPrice - b.finalPrice;
        case 'price-high':
          return b.finalPrice - a.finalPrice;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [wishlistItems, searchTerm, sortBy, selectedCategory]);

  const handleRemoveItem = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const moveAllToCart = () => {
    const inStockItems = filteredItems.filter(item => item.stock > 0);
    
    if (inStockItems.length === 0) {
        showCustomToast("Không có sản phẩm nào còn hàng để thêm", "warning");
        return;
    }

    inStockItems.forEach(item => {
      const priceInfo = calculateItemFinalPrice(item);

      dispatch(addItemToCartAction({
        productId: item.id,
        thumbnail: item.thumbnail,
        name: item.name,
        variants: item.variants[0],
        quantity: 1,
        subTotal: priceInfo.finalPrice,
        price: priceInfo.finalPrice,
      }));
    });
    
    showCustomToast(`Đã thêm ${inStockItems.length} sản phẩm vào giỏ hàng`, "success");
  };
  
  const totalValue = wishlistItems.reduce((total, item) => {
    const priceInfo = calculateItemFinalPrice(item);
    return total + priceInfo.finalPrice;
  }, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
      return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-[calc(100vh-200px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
            <Favorite className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sản Phẩm Yêu Thích</h1>
            <p className="text-gray-600 mt-1 text-sm">Quản lý những sản phẩm bạn đang quan tâm</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Tổng sản phẩm</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{wishlistItems.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Còn hàng</p>
            <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
              {wishlistItems.filter(item => item.stock > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Tổng giá trị</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1 truncate" title={formatPrice(totalValue)}>
              {formatPrice(totalValue)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm trong danh sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>

            {filteredItems.some(item => item.stock > 0) && (
              <button
                onClick={moveAllToCart}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-lg shadow-gray-200"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="whitespace-nowrap">Mua tất cả</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Wishlist Grid */}
      {filteredItems.map((item) => {
        const priceInfo = calculateItemFinalPrice(item);

        return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <ProductCard
              {...item}
              finalPrice={priceInfo.finalPrice}
              discountPercent={priceInfo.discountPercent}
              isFlashSaleActive={priceInfo.isFlashSale}
              isFlashSaleView={false}
              initialIsFavorite={true}
              onRemoveSuccess={handleRemoveItem}
            />
          </motion.div>
        );
      })}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 border-dashed"
        >
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
             <FavoriteBorder className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách yêu thích trống'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchTerm 
              ? 'Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm sản phẩm'
              : 'Hãy "thả tim" các sản phẩm bạn yêu thích để lưu lại và xem sau nhé!'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/products"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200"
            >
              Khám phá sản phẩm
            </Link>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;