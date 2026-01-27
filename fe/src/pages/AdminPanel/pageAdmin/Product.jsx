import React, { useEffect, useState } from "react";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, createNewProduct, updateExistingProduct, removeProduct, enableProduct } from "../../../store/actions/productAction";
import ProductManagement from "../pageAdmin/ProductManagement";
import ProductModal from "../ProductModal";
import { fetchCategories } from "../../../api/fetch/fetchCategories";
import { fetchBrands } from "../../../api/fetch/fetchBrands";

const Product = () => {
  const dispatch = useDispatch();
  const {products, loading} = useSelector((state ) => state.productState);

  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(fetchProducts());

    const loadDependencies = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([fetchBrands(), fetchCategories()]);
        setBrandsList(brandsRes || []);
        setCategoriesList(categoriesRes || []);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu phụ:", err);
      }
    };
    loadDependencies();
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      await dispatch(removeProduct(id));
      await dispatch(fetchProducts());
    }
  };

  const handleSaveProduct = (data) => {
    if (editingProduct) dispatch(updateExistingProduct(editingProduct.id, data));
    else dispatch(createNewProduct(data));
  };
  
  const handleToggleStatus = async (id, currentStatus) => {
      const newStatus = !currentStatus;
      await dispatch(enableProduct(id, newStatus));
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();

    const matchSearch =
      p?.name?.toLowerCase().includes(term) ||
      p?.brand?.name?.toLowerCase().includes(term) ||
      p?.category?.name?.toLowerCase().includes(term);

    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "enabled"
        ? p?.enable === true
        : p?.enable === false;

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm và tồn kho</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lọc trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="enabled">Đã kích hoạt</option>
            <option value="disabled">Chưa kích hoạt</option>
          </select>

          <button
            onClick={handleAddProduct}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors"
          >
            <AddIcon />
            <span>Thêm</span>
          </button>
        </div>
      </div>


      {/* Bảng sản phẩm */}
      <ProductManagement products={currentProducts} loading={loading} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onProductEnabled={handleToggleStatus} />

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Trước</button>
        <span className="text-gray-700">Trang {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Sau</button>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
          product={editingProduct}
          brands={brandsList}
          categories={categoriesList}
        />
      )}
    </>
  );
};

export default Product;
