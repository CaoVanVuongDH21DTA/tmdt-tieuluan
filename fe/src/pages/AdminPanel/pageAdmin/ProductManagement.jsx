import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from "@mui/material";
import { TableSkeleton } from "../skeleton/StatsCardsSkeleton";

const ProductManagement = ({ products = [], loading = false, onEdit, onDelete, onProductEnabled, searchTerm }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleEdit = () => {
    if (selectedProduct) onEdit(selectedProduct);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedProduct) onDelete(selectedProduct.id);
    handleMenuClose();
  };

  const filteredProducts = products?.filter((product) =>
    product?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  );

  if (loading) return <TableSkeleton />;

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <div className="flex flex-col justify-between">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng hàng</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích hoạt</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-6 py-6">
                    <TableSkeleton />
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.thumbnail || product.resources?.find((r) => r.isPrimary)?.url}
                      alt={product.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px]">
                    <div className="line-clamp-2 overflow-hidden text-ellipsis">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.brand?.name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.price?.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock} sp
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock > 0 ? "Còn hàng" : "Liên hệ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        product.enable
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {product.enable ? "Đã kích hoạt" : "Chưa kích hoạt"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <IconButton onClick={(e) => handleMenuOpen(e, product)}>
                      <MoreVertIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}

              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-6 text-center text-gray-500">
                    Không có sản phẩm nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menu hành động */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          className: "rounded-xl shadow-md",
        }}
      >
        {/* Nếu sản phẩm chưa được kích hoạt thì hiển thị nút Kích hoạt */}
        {selectedProduct && !selectedProduct.enable && (
          <MenuItem
            onClick={() => {
              if (selectedProduct && onProductEnabled) {
                onProductEnabled(selectedProduct.id);
              }
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText className="text-green-600">Kích hoạt</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleEdit}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Sửa</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText className="text-red-600">Xóa</ListItemText>
        </MenuItem>
      </Menu>

    </div>
  );
};

export default ProductManagement;
