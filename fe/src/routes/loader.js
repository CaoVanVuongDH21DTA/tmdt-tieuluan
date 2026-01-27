import { getProductBySlug } from '../api/fetch/fetchProducts';
import { setLoading } from '../store/features/common';
import store from '../store/store';

export const loadProductBySlug = async ({params}) => {
  try {
    store.dispatch(setLoading(true));
    const product = await getProductBySlug(params?.slug);
    store.dispatch(setLoading(false));
    return { product };
  } catch (err) {
    store.dispatch(setLoading(false));
    console.error("Failed to load product:", err);
    return { product: null };
  }
};