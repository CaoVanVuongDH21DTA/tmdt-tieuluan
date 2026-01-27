import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../api/fetch/fetchCategories";
import { loadCategories } from "../../store/features/category";
import { setLoading } from "../../store/features/common";
import { useNavigate } from "react-router-dom";
import AsideSkeleton from "../Skeleton/AsideSkeleton"; 
import {
  Laptop as LaptopIcon,
  Memory as MemoryIcon,
  Mouse as MouseIcon,
  Keyboard as KeyboardIcon,
  Headphones as HeadphonesIcon,
  Cable as CableIcon,
  Storage as StorageIcon,
  Monitor as MonitorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const AsideShop = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLocalLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  const categories = useSelector(
    (state) => state?.categoryState?.categories || []
  );

  useEffect(() => {
    setLocalLoading(true);
    dispatch(setLoading(true));

    Promise.all([fetchCategories()])
      .then(([resCategories]) => {
        if (Array.isArray(resCategories)) dispatch(loadCategories(resCategories));
      })
      .catch((err) => console.error("Fetch aside data error:", err))
      .finally(() => {
        setLocalLoading(false);
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleCategoryTypeSelect = async (cat, type) => {
    navigate(`/products`, {
      state: {
        autoFilter: {
          categoryId: cat.id,
          filterKey: "type",
          filterValue: type.name,
        },
      },
    });
    if (onClose) onClose();
  };

  // Icon mapping for laptop-related categories
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('laptop') || name.includes('máy tính')) return <LaptopIcon className="w-5 h-5" />;
    if (name.includes('linh kiện') || name.includes('ram') || name.includes('cpu')) return <MemoryIcon className="w-5 h-5" />;
    if (name.includes('chuột') || name.includes('mouse')) return <MouseIcon className="w-5 h-5" />;
    if (name.includes('bàn phím') || name.includes('keyboard')) return <KeyboardIcon className="w-5 h-5" />;
    if (name.includes('tai nghe') || name.includes('headphone')) return <HeadphonesIcon className="w-5 h-5" />;
    if (name.includes('cáp') || name.includes('adapter') || name.includes('sạc')) return <CableIcon className="w-5 h-5" />;
    if (name.includes('màn hình') || name.includes('monitor')) return <MonitorIcon className="w-5 h-5" />;
    if (name.includes('ổ cứng') || name.includes('ssd') || name.includes('hdd')) return <StorageIcon className="w-5 h-5" />;
    return <LaptopIcon className="w-5 h-5" />;
  };

  return (
    <aside className="w-full bg-white shadow-lg border border-gray-100 rounded-xl p-4 overflow-y-auto custom-scroll text-black h-full">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <LaptopIcon className="text-blue-600 w-6 h-6" />
          Danh Mục Sản Phẩm
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Laptop & Phụ kiện chính hãng
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && <AsideSkeleton />}

      {!loading && categories.length === 0 && (
        <div className="text-center py-8">
          <LaptopIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 italic">
            Không có danh mục nào
          </p>
        </div>
      )}

      {/* Categories List */}
      {categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">
                    {cat.name}
                  </span>
                </div>
                {expandedCategories[cat.id] ? (
                  <ExpandLessIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ExpandMoreIcon className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Category Types */}
              {expandedCategories[cat.id] && (
                <div className="bg-white p-2 border-t border-gray-100">
                  <div className="space-y-1">
                    {cat.categoryTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleCategoryTypeSelect(cat, type)}
                        className="w-full p-2 rounded-md text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2 group"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-blue-500 transition-colors" />
                        <span className="flex-1">{type.name}</span>
                        <span className="text-xs text-gray-400 group-hover:text-blue-400">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Featured Brands */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Thương Hiệu Nổi Bật
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI'].map(brand => (
            <div
              key={brand}
              className="text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 p-2 rounded text-center cursor-pointer transition-colors duration-200 border border-gray-200 hover:border-blue-200"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default AsideShop;