import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SectionHeading from "../SectionsHeading/SectionHeading";
import { fetchBrands } from "../../api/fetch/fetchBrands";
import { Category, Storefront } from "@mui/icons-material";

export const DiscoverySection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("category"); 
  
  const categories = useSelector((state) => state.categoryState.categories || []);
  const allTypes = categories.flatMap((cat) => 
    cat.categoryTypes.map((type) => ({ ...type, category: cat }))
  );

  const handleCategoryTypeSelect = (cat, type) => {
    navigate("/products", {
      state: { autoFilter: { categoryId: cat.id, filterKey: "type", filterValue: type.name } },
    });
  };

  const [supplier, setSupplier] = useState([]);

  useEffect(() => {
    const loadBrands = async () => {
      const data = await fetchBrands();
      if (data) setSupplier(data);
    };
    loadBrands();
  }, []);

  return (
    <div className="my-12 bg-white border border-gray-100 shadow-sm py-8 rounded-2xl animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <SectionHeading 
                title={activeTab === 'category' ? "Danh Mục Sản Phẩm" : "Đối Tác Phân Phối"} 
                subtitle={activeTab === 'category' ? "Tìm kiếm theo nhu cầu của bạn" : "Các thương hiệu uy tín hàng đầu"}
            />
            <div className="flex p-1 bg-gray-100 rounded-xl self-start md:self-auto">
                <button
                    onClick={() => setActiveTab("category")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        activeTab === "category" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Category fontSize="small" /> Danh Mục
                </button>
                <button
                    onClick={() => setActiveTab("brand")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        activeTab === "brand" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Storefront fontSize="small" /> Thương Hiệu
                </button>
            </div>
        </div>

        <div className="min-h-[200px]">
            {activeTab === "category" && (
                <div className="animate-fadeIn">
                     {allTypes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">Đang cập nhật danh mục...</p>
                        </div>
                     ) : (
                        // Grid Layout cho Category
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {allTypes.map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => handleCategoryTypeSelect(type.category, type)}
                                    className="group flex flex-col items-center p-4 rounded-xl border border-gray-100 
                                        hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white hover:bg-gray-50"
                                >
                                    <div className="w-14 h-14 mb-3 p-2 bg-gray-50 rounded-xl group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                        <img src={type.imgCategory} alt={type.name} className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600 line-clamp-2">
                                        {type.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                     )}
                </div>
            )}
            
            {activeTab === "brand" && (
                <div className="animate-fadeIn">
                     {supplier.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">Đang cập nhật đối tác...</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {supplier.map((brand) => (
                                <div 
                                    key={brand.id} 
                                    className="group flex flex-col items-center justify-center p-4 h-32 rounded-xl border border-gray-100 
                                    bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="w-full h-16 flex items-center justify-center mb-2">
                                        <img 
                                            src={brand.logoUrl} 
                                            alt={brand.name} 
                                            className="max-w-full max-h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                        />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-wide">
                                        {brand.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                     )}
                </div>
            )}
        </div>
        
        <div className="text-center mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400">
             {activeTab === 'category' 
                ? `Hơn ${allTypes.length} loại sản phẩm đang chờ bạn khám phá`
                : `Tự hào hợp tác chính hãng với ${supplier.length}+ thương hiệu`
             }
        </div>
      </div>
    </div>
  );
};