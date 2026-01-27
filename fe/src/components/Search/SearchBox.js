import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProductBySearch } from "../../api/fetch/fetchProducts";
import imageDF from "../../assets/img/pictureDF.png"
import { Search as SearchIcon, Close as CloseIcon, FlashOn as FlashOnIcon } from "@mui/icons-material";

const SearchBox = ({ isMobile = false, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const searchBoxRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setFilteredProducts([]);
        return;
      }
      try {
        const products = await getProductBySearch(searchTerm);
        setFilteredProducts(products || []);
      } catch (error) {
        setFilteredProducts([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleProductClick = (slug) => {
    setSearchTerm("");
    setFilteredProducts([]);
    navigate(`/product/${slug}`);
    if (onClose) onClose();
  };

  const calculateDisplayPrice = (product) => {
    const now = new Date();
    const basePrice = product?.price || 0;

    const isFlashSale = 
      product?.flashSale && 
      new Date(product.flashSale.endDate) > now && 
      new Date(product.flashSale.startDate) <= now;

    let finalPrice = basePrice;
    let percent = 0;

    if (isFlashSale) {
      percent = product.flashSale.discountPercent;
      finalPrice = basePrice * (1 - percent / 100);
    } else {
      percent = product?.discount || 0;
      finalPrice = basePrice * (1 - percent / 100);
    }

    return {
      finalPrice: Math.round(finalPrice),
      originalPrice: basePrice,
      isFlashSale,
      hasDiscount: percent > 0,
      discountPercent: percent 
    };
  };

  return (
    <div className="pb-4 md:pb-0 w-full">
      <div
        className={`relative ${isMobile ? "flex bg-white rounded-lg" : "hidden md:flex items-center bg-white rounded-lg shadow-md w-full max-w-full"}`}
        ref={searchBoxRef}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Bạn cần tìm gì?"
          className="flex-1 px-3 py-2 text-black text-sm outline-none rounded-lg"
        />
        {isMobile ? (
          <button className="px-3 text-primary" onClick={onClose}>
            <CloseIcon />
          </button>
        ) : (
          <button className="absolute right-1 text-primary">
            <SearchIcon fontSize="medium" />
          </button>
        )}

        {/* --- KẾT QUẢ TÌM KIẾM --- */}
        {searchTerm.trim() && (
          <ul className="absolute top-full left-0 w-full bg-white shadow-lg mt-1 rounded max-h-80 overflow-y-auto z-50 border">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const { finalPrice, originalPrice, isFlashSale, hasDiscount, discountPercent } = calculateDisplayPrice(product);

                return (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`
                          w-16 h-16 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden relative
                          ${isFlashSale 
                            ? 'border border-red-500 shadow-[0_0_10px_-2px_rgba(220,38,38,0.4)]' 
                            : 'border border-gray-200'
                          }
                        `}
                      >
                        <img
                          src={product.thumbnail || imageDF} 
                          className="w-full h-full object-contain p-1"
                          alt={product.name}
                          onError={(e) => { e.target.src = imageDF; }}
                        />
                        
                        {isFlashSale && <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay pointer-events-none"></div>}
                      </div>

                      {isFlashSale && (
                        <div className="absolute -top-2 -left-2 z-10 animate-pulse">
                          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm flex items-center border border-white">
                            <FlashOnIcon style={{ fontSize: 10 }} />
                            <span>-{discountPercent}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* --- THÔNG TIN TEXT --- */}
                    <div className="grid gap-0.5 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate" title={product.name}>
                        {product.name}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {/* Giá bán */}
                        <span className={`text-xs font-bold ${isFlashSale ? 'text-red-600' : 'text-blue-600'}`}>
                          {finalPrice?.toLocaleString()}₫
                        </span>
                        
                        {/* Giá gốc */}
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {originalPrice?.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-4 text-sm text-gray-500 italic text-center">
                Không tìm thấy sản phẩm nào
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBox;