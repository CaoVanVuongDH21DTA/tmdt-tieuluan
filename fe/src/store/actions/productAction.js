import {
  getAllProductsHome,
  createProduct,
  updateProductById,
  deleteProductById,
  toggleProductEnable,
} from "../../api/product/product";

import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFail,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../features/product";

import { showCustomToast } from "../../components/Toaster/ShowCustomToast";

export const fetchProducts = () => async (dispatch) => {
  try {
    dispatch(fetchProductsStart());

    const data = await getAllProductsHome();

    dispatch(fetchProductsSuccess(data));
  } catch (err) {
    dispatch(fetchProductsFail(err.message || "Fetch products failed"));
  }
};

export const createNewProduct = (productData) => async (dispatch) => {
  try {
    const data = await createProduct(productData);
    dispatch(addProduct(data));
    showCustomToast("Thêm sản phẩm thành công!", "success");
  } catch (error) {
    showCustomToast("Lỗi khi thêm sản phẩm!", "error");
  }
};

export const updateExistingProduct = (id, productData) => async (dispatch) => {
  try {
    const data = await updateProductById(id, productData);
    dispatch(updateProduct(data));
    showCustomToast("Cập nhật sản phẩm thành công!", "success");
  } catch (error) {
    showCustomToast("Lỗi khi cập nhật sản phẩm!", "error");
  }
};

export const removeProduct = (id) => async (dispatch) => {
  try {
    await deleteProductById(id);
    dispatch(deleteProduct(id));
    showCustomToast("Xóa sản phẩm thành công!", "success");
  } catch (error) {
    dispatch(fetchProductsFail(error.message));
    showCustomToast("Lỗi khi xóa sản phẩm!", "error");
  }
};

export const enableProduct = (id, enable) => async (dispatch, getState) => {
  try {
    await toggleProductEnable(id, enable);
    const { products } = getState().productState;
    const existingProduct = products.find(p => p.id === id);

    if (existingProduct) {
        dispatch(updateProduct({ ...existingProduct, enable }));
    }
    showCustomToast("Cập nhật trạng thái sản phẩm thành công!", "success");
  } catch (error) {
    console.error(error);
    showCustomToast("Không thể cập nhật trạng thái sản phẩm!", "error");
  }
};