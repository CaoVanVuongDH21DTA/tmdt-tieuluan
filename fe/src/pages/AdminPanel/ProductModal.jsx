import { useEffect, useState } from "react";
import Modal from "./common/Modal"; 
import { fetchCategoryTypesByCategory } from "../../api/fetch/fetchCategories";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { 
  PhotoCamera as PhotoIcon, 
  DeleteOutline as DeleteIcon, 
  AddCircleOutline as AddIcon,
  Link as LinkIcon,
  Inventory2 as VariantIcon,
  Style as AttributeIcon
} from "@mui/icons-material";

// --- HÀM HELPER GIỮ NGUYÊN ---
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Cập nhật initial state có thêm variants
const initialFormState = {
    name: "", slug: "", description: "", price: "", discount: "", stock: "",
    rating: 0, newArrival: "", brandId: "", categoryId: "", categoryTypeId: "",
    thumbnail: "", resources: [], specifications: [], 
    variants: [] 
};

// --- Sub Components ---
const InputField = ({ label, field, formData, onChange, type = "text", placeholder, required }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={formData[field]}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, field, formData, onChange, options, placeholder, disabled }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
        <select
        value={formData[field] || ""}
        onChange={(e) => onChange(field, e.target.value)}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "bg-white text-gray-800 hover:border-gray-400"}`}
        >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
            {opt.name}
            </option>
        ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className={`w-4 h-4 ${disabled ? "text-gray-300" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
  </div>
);

const ProductModal = ({ isOpen, onClose, product, onSave, brands = [], categories = [] }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [dynamicCategoryTypes, setDynamicCategoryTypes] = useState([]);
  const [isSlugManuallyChanged, setIsSlugManuallyChanged] = useState(false);

  // --- INIT DATA ---
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price || "",
        discount: product.discount ?? "",
        stock: product.stock || "",
        rating: product.rating ?? 0,
        newArrival: product.newArrival || false,
        brandId: product.brand?.id || "",
        categoryId: product.category?.id || "",
        categoryTypeId: product.categoryType?.id || "",
        thumbnail: product.thumbnail || "",
        resources: product.resources?.length > 0 ? product.resources.map(r => ({ url: r.url })) : [],
        specifications: product.specifications || [],
        variants: product.variants ? product.variants.map(v => ({
            id: v.id,
            sku: v.sku || "",
            price: v.price || "",
            stockQuantity: v.stockQuantity || "",
            attributes: v.attributes 
                ? Object.entries(v.attributes).map(([key, value]) => ({ 
                    attributeName: key, 
                    attributeValue: value 
                  })) 
                : []
        })) : []
      });

      setIsSlugManuallyChanged(true);
    } else {
      setFormData(initialFormState);
      setDynamicCategoryTypes([]);
      setIsSlugManuallyChanged(false);
    }
  }, [product, isOpen]);

  // --- LOAD CATEGORY TYPES ---
  useEffect(() => {
    const loadCategoryTypes = async () => {
      if (!formData.categoryId) {
        setDynamicCategoryTypes([]);
        return;
      }
      try {
        const types = await fetchCategoryTypesByCategory(formData.categoryId);
        setDynamicCategoryTypes(types || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategoryTypes();
  }, [formData.categoryId]);

  // --- HANDLERS CHUNG ---
  const handleChange = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      if (key === "name" && !isSlugManuallyChanged) {
        newData.slug = generateSlug(value);
      }
      if (key === "categoryId") newData.categoryTypeId = "";
      return newData;
    });
  };

  const handleSlugChange = (e) => {
    setFormData(prev => ({ ...prev, slug: e.target.value }));
    setIsSlugManuallyChanged(true);
  };
  
  //Kiểm tra dữ liệu trước khi tạo mới xem đã nhập đầy đủ thông tin sản phẩm chưa
  const validateForm = () => {
    const errors = [];

    // 1. Kiểm tra thông tin cơ bản
    if (!formData.name.trim()) errors.push("Tên sản phẩm");
    if (!formData.slug.trim()) errors.push("Slug (đường dẫn)");
    if (!formData.price || Number(formData.price) <= 0) errors.push("Giá hiển thị hợp lệ");

    // 2. Kiểm tra phân loại
    if (!formData.brandId) errors.push("Thương hiệu");
    if (!formData.categoryId) errors.push("Danh mục");
    // Nếu danh mục đó có CategoryType thì bắt buộc phải chọn
    if (dynamicCategoryTypes.length > 0 && !formData.categoryTypeId) {
        errors.push("Loại sản phẩm");
    }

    // 3. Kiểm tra Biến thể (Variants)
    if (formData.variants.length > 0) {
        formData.variants.forEach((v, index) => {
            if (!v.sku.trim()) errors.push(`Mã SKU tại dòng ${index + 1}`);
            if (!v.price || Number(v.price) < 0) errors.push(`Giá bán tại dòng SKU ${index + 1}`);
            if (v.stockQuantity === "" || Number(v.stockQuantity) < 0) errors.push(`Số lượng kho tại dòng SKU ${index + 1}`);
            
            // Kiểm tra thuộc tính bên trong biến thể
            v.attributes.forEach((attr, aIndex) => {
                if (!attr.attributeName.trim() || !attr.attributeValue.trim()) {
                    errors.push(`Thuộc tính chưa đầy đủ tại dòng SKU ${index + 1}`);
                }
            });
        });
    }

    // 4. Kiểm tra Thông số kỹ thuật (Nếu đã thêm dòng thì phải nhập đủ)
    if (formData.specifications.length > 0) {
        formData.specifications.forEach((spec, index) => {
            if (!spec.name.trim() || !spec.value.trim()) {
                errors.push(`Thông số kỹ thuật dòng ${index + 1} chưa đầy đủ`);
            }
        });
    }

    return errors;
  };

  // --- HANDLERS RESOURCES & SPECS ---
  const handleAddResource = () => setFormData(prev => ({ ...prev, resources: [...prev.resources, { url: "" }] }));
  const handleRemoveResource = (index) => setFormData(prev => ({ ...prev, resources: prev.resources.filter((_, i) => i !== index) }));
  
  const handleAddSpec = () => setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { name: "", value: "" }] }));
  const handleRemoveSpec = (index) => setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));

  // --- HANDLERS VARIANTS (MỚI) ---
  const handleAddVariant = () => {
      setFormData(prev => ({
          ...prev,
          variants: [
              ...prev.variants,
              { sku: "", price: "", stockQuantity: "", attributes: [{ attributeName: "", attributeValue: "" }] }
          ]
      }));
  };

  const handleRemoveVariant = (index) => {
      setFormData(prev => ({
          ...prev,
          variants: prev.variants.filter((_, i) => i !== index)
      }));
  };

  const handleVariantChange = (index, field, value) => {
      const newVariants = [...formData.variants];
      newVariants[index][field] = value;
      setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  // Xử lý Attribute trong Variant
  const handleAddVariantAttribute = (variantIndex) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].attributes.push({ attributeName: "", attributeValue: "" });
      setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleRemoveVariantAttribute = (variantIndex, attrIndex) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].attributes = newVariants[variantIndex].attributes.filter((_, i) => i !== attrIndex);
      setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleVariantAttributeChange = (variantIndex, attrIndex, field, value) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].attributes[attrIndex][field] = value;
      setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  // --- SUBMIT ---
  const handleSubmit = () => {
    const errors = validateForm();

    if (errors.length > 0) {
        showCustomToast(
            <div className="text-sm">
                <span className="font-bold">Vui lòng kiểm tra các mục sau:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                    ))}
                </ul>
            </div>,
            "error" // Tham số type="error" để hiện màu đỏ và icon cảnh báo
        );
        return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      stock: Number(formData.stock || 0),
      rating: Number(formData.rating || 0),
      brand: formData.brandId ? { id: formData.brandId } : null,
      category: formData.categoryId ? { id: formData.categoryId } : null,
      categoryType: formData.categoryTypeId ? { id: formData.categoryTypeId } : null,
      resources: [
        ...(formData.thumbnail ? [{ name: "Thumbnail", url: formData.thumbnail, type: "IMAGE", isPrimary: true }] : []),
        ...formData.resources.filter(r => r.url).map(r => ({ name: "Image", url: r.url, type: "IMAGE", isPrimary: false })),
      ],
      // Xử lý variants để đảm bảo số liệu là Number
      variants: formData.variants.map(v => {
          const attributesMap = {}; // Khởi tạo Object rỗng
          
          // Duyệt mảng attributes trên form và gán vào Object
          if (v.attributes && Array.isArray(v.attributes)) {
              v.attributes.forEach(attr => {
                  if (attr.attributeName && attr.attributeValue) {
                      attributesMap[attr.attributeName] = attr.attributeValue;
                  }
              });
          }

          return {
            ...v,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity),
            attributes: attributesMap 
          };
      })
    };
    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
      onSave={handleSubmit}
      saveText={product ? "Lưu thay đổi" : "Hoàn tất"}
      width="max-w-6xl w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh] overflow-y-auto custom-scroll p-1">
        
        {/* === CỘT TRÁI (MAIN CONTENT - CHIẾM 8/12) === */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Block 1: Thông tin chung */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-2">Thông tin cơ bản</h3>
                
                <InputField label="Tên sản phẩm (Model)" field="name" formData={formData} onChange={handleChange} placeholder="VD: Laptop Dell XPS 15..." required />
                
                {/* Slug Input Group */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Đường dẫn (Slug)</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-gray-50">
                        <div className="bg-gray-100 px-3 py-2.5 border-r border-gray-300 text-gray-500 text-sm select-none whitespace-nowrap">
                            <LinkIcon fontSize="small" className="mr-1 relative -top-[1px]"/> /product/
                        </div>
                        <input 
                            type="text" 
                            value={formData.slug} 
                            onChange={handleSlugChange}
                            className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none font-medium bg-transparent w-full"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mô tả chi tiết</label>
                    <textarea 
                        rows="4" 
                        value={formData.description} 
                        onChange={(e) => handleChange("description", e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Block 2: Giá & Kho (Hiển thị chung/Giá khởi điểm) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4">Giá hiển thị & Tổng kho</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <InputField label="Giá hiển thị (từ)" field="price" type="number" formData={formData} onChange={handleChange} required />
                    <InputField label="Giảm giá (%)" field="discount" type="number" formData={formData} onChange={handleChange} />
                    <InputField label="Tổng tồn kho (Optional)" field="stock" type="number" formData={formData} onChange={handleChange} />
                </div>
            </div>

            {/* Block 3: QUẢN LÝ BIẾN THỂ (VARIANTS) - NEW SECTION */}
            <div className={`p-6 rounded-xl border shadow-sm ${formData.variants.length > 0 && validateForm().some(e => e.includes('SKU')) ? 'bg-red-50 border-red-200' : 'bg-blue-50/50 border-blue-100'}`}>
                <div className="flex justify-between items-center border-b border-blue-200 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center">
                        <VariantIcon className="mr-2" fontSize="small"/> Biến thể sản phẩm (SKU)
                    </h3>
                    <button onClick={handleAddVariant} className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg flex items-center transition-colors shadow-sm">
                        <AddIcon fontSize="small" className="mr-1"/> Thêm SKU
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 relative group hover:border-blue-300 transition-colors">
                            {/* Logic hiển thị Variant (Giữ nguyên UI cũ nhưng thêm validation visual nếu cần) */}
                            <button onClick={() => handleRemoveVariant(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"><DeleteIcon/></button>

                            {/* SKU - Price - Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 pr-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Mã SKU <span className="text-red-500">*</span></label>
                                    <input type="text" value={variant.sku} placeholder="VD: MAC-M1-8G" onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                        className={`w-full mt-1 border rounded px-2 py-1.5 text-sm outline-none ${!variant.sku ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Giá bán <span className="text-red-500">*</span></label>
                                    <input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        className={`w-full mt-1 border rounded px-2 py-1.5 text-sm outline-none ${!variant.price ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Số lượng kho <span className="text-red-500">*</span></label>
                                    <input type="number" value={variant.stockQuantity} onChange={(e) => handleVariantChange(index, 'stockQuantity', e.target.value)}
                                        className={`w-full mt-1 border rounded px-2 py-1.5 text-sm outline-none ${variant.stockQuantity === "" ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} />
                                </div>
                            </div>

                            {/* Attributes */}
                            <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-gray-500 flex items-center"><AttributeIcon fontSize="small" className="mr-1" style={{fontSize: 14}}/> Thuộc tính</span>
                                    <button onClick={() => handleAddVariantAttribute(index)} className="text-xs text-blue-600 hover:underline">+ Thêm thuộc tính</button>
                                </div>
                                <div className="space-y-2">
                                    {variant.attributes.map((attr, attrIndex) => (
                                        <div key={attrIndex} className="flex gap-2 items-center">
                                            <input type="text" placeholder="Tên (VD: RAM)" value={attr.attributeName}
                                                onChange={(e) => handleVariantAttributeChange(index, attrIndex, 'attributeName', e.target.value)}
                                                className={`w-1/3 border rounded px-2 py-1 text-xs outline-none ${!attr.attributeName ? 'border-red-300' : 'border-gray-300'}`} />
                                            
                                            <input type="text" placeholder="Giá trị (VD: 8GB)" value={attr.attributeValue}
                                                onChange={(e) => handleVariantAttributeChange(index, attrIndex, 'attributeValue', e.target.value)}
                                                className={`flex-1 border rounded px-2 py-1 text-xs outline-none ${!attr.attributeValue ? 'border-red-300' : 'border-gray-300'}`} />
                                            
                                            <button onClick={() => handleRemoveVariantAttribute(index, attrIndex)} className="text-gray-400 hover:text-red-500"><DeleteIcon style={{fontSize: 16}}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.variants.length === 0 && <div className="text-center py-6 border border-dashed border-blue-200 rounded-lg bg-white text-blue-400">Chưa có biến thể nào.</div>}
                </div>
            </div>

            {/* Block 4: Thông số kỹ thuật (Specs) */}
            <div className="space-y-3">
                {formData.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <input 
                            type="text" 
                            value={spec.name} 
                            placeholder="Tên (VD: Màn hình)" 
                            onChange={(e) => { 
                                const newSpecs = formData.specifications.map((item, index) => 
                                    index === i ? { ...item, name: e.target.value } : item
                                );
                                handleChange("specifications", newSpecs); 
                            }} 
                            className="w-1/3 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" 
                        />
                        <input 
                            type="text" 
                            value={spec.value} 
                            placeholder="Giá trị (VD: 14 inch)" 
                            onChange={(e) => { 
                                const newSpecs = formData.specifications.map((item, index) => 
                                    index === i ? { ...item, value: e.target.value } : item
                                );
                                handleChange("specifications", newSpecs); 
                            }} 
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" 
                        />
                        <button onClick={() => handleRemoveSpec(i)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition-all">
                            <DeleteIcon fontSize="small"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* === CỘT PHẢI (SIDEBAR - CHIẾM 4/12) === */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Block 5: Phân loại */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Phân loại</h3>
                
                {/* Toggle New Arrival */}
                <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm font-semibold text-blue-800">Hàng mới về</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.newArrival} onChange={(e) => handleChange("newArrival", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <SelectField label="Thương hiệu" field="brandId" formData={formData} onChange={handleChange} options={brands} placeholder="-- Chọn thương hiệu --" />
                <SelectField label="Danh mục" field="categoryId" formData={formData} onChange={handleChange} options={categories} placeholder="-- Chọn danh mục --" />
                <SelectField label="Loại sản phẩm" field="categoryTypeId" formData={formData} onChange={handleChange} options={dynamicCategoryTypes} placeholder={formData.categoryId ? "-- Chọn loại --" : "Chọn danh mục trước"} disabled={!formData.categoryId} />
            </div>

            {/* Block 6: Quản lý Hình ảnh */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Thư viện ảnh</h3>
                
                {/* Thumbnail */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ảnh đại diện</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 transition-colors relative group min-h-[150px] bg-gray-50 flex flex-col items-center justify-center overflow-hidden">
                        {formData.thumbnail ? (
                            <>
                                <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-contain rounded" />
                                <button onClick={() => handleChange("thumbnail", "")} className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><DeleteIcon fontSize="small"/></button>
                            </>
                        ) : (
                            <div className="text-gray-400 py-4">
                                <PhotoIcon style={{fontSize: 40}}/>
                                <p className="text-xs mt-2 font-medium">Nhập URL bên dưới</p>
                            </div>
                        )}
                    </div>
                    <input type="text" value={formData.thumbnail} onChange={(e) => handleChange("thumbnail", e.target.value)} className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="URL ảnh đại diện..." />
                </div>

                {/* Gallery */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Album ảnh ({formData.resources.length})</label>
                        <button onClick={handleAddResource} className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-2 py-1 rounded transition-colors">+ Thêm URL</button>
                    </div>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scroll">
                        {formData.resources.map((res, i) => (
                            <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200">
                                <div className="w-8 h-8 flex-shrink-0 bg-gray-200 rounded overflow-hidden flex items-center justify-center border">
                                    {res.url ? <img src={res.url} alt="" className="w-full h-full object-cover"/> : <PhotoIcon className="text-gray-400" style={{fontSize: 16}}/>}
                                </div>
                                <input type="text" value={res.url} onChange={(e) => { const u = [...formData.resources]; u[i].url = e.target.value; handleChange("resources", u); }} className="flex-1 bg-transparent border-none text-xs focus:ring-0 px-0" placeholder="URL ảnh..." />
                                <button onClick={() => handleRemoveResource(i)} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><DeleteIcon style={{ fontSize: 18 }} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </Modal>
  );
};

export default ProductModal;