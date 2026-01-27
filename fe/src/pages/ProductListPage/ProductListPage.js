import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { FilterList as FilterIcon, } from "@mui/icons-material";
import PriceFilter from "../../components/Filters/PriceFilter";
import ProductCard from "./ProductCard"; 
import MetaDataFilter from "../../components/Filters/MetaDataFilter";
import { setLoading } from "../../store/features/common";
import { fetchCategories } from "../../api/fetch/fetchCategories";
import ProductCardSkeleton from "../../components/Skeleton/ProductCardSkeleton";
import PriceRangeSkeleton from "../../components/Skeleton/PriceRangeSkeleton";
import AsideSkeleton from "../../components/Skeleton/AsideSkeleton";
import { selectUserInfo } from "../../store/features/user";
import { getWishlistByUser } from "../../api/product/wishlist";
import { calculateItemFinalPrice } from "../../utils/price-util";

const ProductListPage = () => {
  const location = useLocation();
  const { filterKey, filterValue } = location.state?.autoFilter || {};
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.commonState.loading);
  
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    price: { min: 0, max: 999999999 },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("default");

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

  const handleFilterChange = (specType, selectedValues) => {
    setFilters((prev) => ({ ...prev, [specType]: selectedValues }));
  };

  // =================================================================
  // 1. HÀM TÍNH GIÁ THỰC TẾ
  // =================================================================
  const getEffectivePrice = (product) =>
    calculateItemFinalPrice(product).finalPrice;

  // =================================================================
  // 2. SETUP PRICE RANGE TỰ ĐỘNG
  // =================================================================
  useEffect(() => {
    if (products.length > 0) {
      const effectivePrices = products
        .map((p) => getEffectivePrice(p))
        .filter((p) => !isNaN(p));

      if (effectivePrices.length > 0) {
        const min = Math.floor(Math.min(...effectivePrices));
        const max = Math.ceil(Math.max(...effectivePrices));
        setPriceRange({ min, max });
        // Chỉ update filter nếu chưa có giá trị user chọn (để tránh reset khi đang lọc)
        if (filters.price.min === 0 && filters.price.max === 999999999) {
             setFilters((prev) => ({ ...prev, price: { min, max } }));
        }
      }
    }
  }, [products]);

  // =================================================================
  // 3. FETCH DATA
  // =================================================================
  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const categories = await fetchCategories();
        const allProducts = [];
        const filtersByCategory = {};

        categories.forEach((cat) => {
          const types = [];
          cat.categoryTypes?.forEach((ct) => {
            types.push({ id: ct.id, code: ct.code, name: ct.name });
            
            ct.products
            ?.filter((p) => p.enable === true)
            .forEach((p) => {
              allProducts.push({
                ...p, 
                categoryType: { id: ct.id, name: ct.name },
                category: { id: cat.id, name: cat.name },
              });
            });
          });
          if (types.length > 0) filtersByCategory[cat.name] = types;
        });

        setProducts(allProducts);
        setAvailableFilters(filtersByCategory);

        // Auto filter logic
        if (filterKey && filterValue && filterKey === "type") {
          const categoryName = categories.find((c) =>
              c.categoryTypes?.some((ct) => ct.name === filterValue)
          )?.name;
          if (categoryName) {
              setFilters((prev) => ({ ...prev, [categoryName]: [filterValue] }));
          }
        }
      } catch (err) {
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchData();
  }, [dispatch, filterKey, filterValue]);

  // =================================================================
  // 4. FILTER & SORT LOGIC
  // =================================================================
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const currentPrice = getEffectivePrice(product);
      return Object.entries(filters).every(([key, filterValues]) => {
        if (key === "price") {
          return currentPrice >= filterValues.min && currentPrice <= filterValues.max;
        }
        if (Array.isArray(filterValues) && filterValues.length > 0) {
           return filterValues.includes(product.categoryType?.name);
        }
        return true;
      });
    });

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating-desc":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Ưu tiên sản phẩm có Flash Sale còn hạn lên đầu
        result.sort((a, b) => {
             const now = new Date();
             const aIsFlash = a.flashSale && new Date(a.flashSale.endDate) > now;
             const bIsFlash = b.flashSale && new Date(b.flashSale.endDate) > now;
             if (aIsFlash && !bIsFlash) return -1;
             if (!aIsFlash && bIsFlash) return 1;
             return 0;
        });
        break;
    }
    return result;
  }, [products, filters, sortBy]);

  const productCount = filteredProducts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tất cả sản phẩm</h1>
              <p className="text-sm text-gray-500 mt-1">Tìm thấy <span className="font-bold text-blue-600">{productCount}</span> sản phẩm</p>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button onClick={() => setShowFilters(true)} className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FilterIcon /> <span className="font-medium text-sm">Bộ lọc</span>
              </button>
              <div className="flex items-center gap-2 flex-1 lg:flex-none">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full lg:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer bg-white">
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                  <option value="name-desc">Tên: Z-A</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Bộ lọc</h3>
                    <button
                        onClick={() => setFilters({
                            price: { min: priceRange.min, max: priceRange.max },
                            ...Object.fromEntries(Object.keys(availableFilters).map((k) => [k, []])),
                        })}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        Xóa tất cả
                    </button>
                </div>

                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Khoảng giá</h4>
                    {loading ? <PriceRangeSkeleton /> : (
                        <PriceFilter min={priceRange.min} max={priceRange.max} onChange={(range) => setFilters((prev) => ({ ...prev, price: range }))} />
                    )}
                </div>
                <div className="border-t border-gray-100 my-4"></div>
                <div className="space-y-4">
                    {loading ? Array.from({ length: 3 }).map((_, i) => <AsideSkeleton key={i} loading={true} />) : (
                        Object.entries(availableFilters).map(([specType, values]) => (
                            <div key={specType} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <MetaDataFilter title={specType} data={Array.isArray(values) ? values : []} selectedValues={filters[specType] || []} onChange={(vals) => handleFilterChange(specType, vals)} />
                            </div>
                        ))
                    )}
                </div>
             </div>
          </aside>

          {/* Mobile Overlay */}
          <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${showFilters ? "visible" : "invisible"}`}>
            <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${showFilters ? "opacity-100" : "opacity-0"}`} onClick={() => setShowFilters(false)} />
            <div className={`absolute top-0 left-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${showFilters ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
                <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Bộ lọc</h3>
                        <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="mb-6">
                          <h4 className="font-medium mb-3">Khoảng giá</h4>
                          <PriceFilter min={priceRange.min} max={priceRange.max} onChange={(range) => setFilters((prev) => ({ ...prev, price: range }))} />
                    </div>
                    {Object.entries(availableFilters).map(([specType, values]) => (
                        <div key={specType} className="mb-4">
                             <MetaDataFilter title={specType} data={values} selectedValues={filters[specType] || []} onChange={(vals) => handleFilterChange(specType, vals)} />
                        </div>
                    ))}
                    <button onClick={() => setShowFilters(false)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 shadow-blue-200 shadow-lg">
                        Xem {productCount} kết quả
                    </button>
                </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {loading ? Array.from({ length: 8 }).map((_, idx) => <ProductCardSkeleton key={idx} />) : (
                filteredProducts.map((item) => (
                  <div key={item.id} className="h-full"> 
                    <ProductCard 
                      {...item}
                      finalPrice={calculateItemFinalPrice(item).finalPrice}
                      discountPercent={calculateItemFinalPrice(item).discountPercent}
                      isFlashSaleActive={calculateItemFinalPrice(item).isFlashSale}
                      isFlashSaleView={false}
                      initialIsFavorite={wishlistIds.includes(item.id)}
                      onRemoveSuccess={handleRemoveFromWishlist}
                    />

                  </div>
                ))
              )}
            </div>

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-6 text-center max-w-xs">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
                <button
                  onClick={() => setFilters({
                    price: { min: priceRange.min, max: priceRange.max },
                    ...Object.fromEntries(Object.keys(availableFilters).map((key) => [key, []])),
                  })}
                  className="px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;