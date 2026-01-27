import axios from "axios";
import { API_BASE_URL, API_URLS, getHeaders } from "../constant"

export const fetchCategories = async () => {
  const url = API_BASE_URL + API_URLS.GET_CATEGORIES;

  try {
    const result = await axios.get(url, { headers: getHeaders() });
    return result.data; 
  } catch (e) {
    console.error('Fetch categories error:', e);
  }
};

export const fetchCategoryTypesByCategory = async (categoryId) => {
  const url = API_BASE_URL + API_URLS.GET_CATEGORY_TYPE(categoryId);
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    const category = response.data;

    return Array.isArray(category.categoryTypes)
      ? category.categoryTypes.map((type) => ({
          id: type.id,
          name: type.name,
          categoryId: categoryId, 
          description: type.description,
          imgCategory: type.imgCategory,
          code: type.code,
        }))
      : [];
  } catch (error) {
    console.error("Lỗi khi fetch category types theo categoryId:", error);
    return [];
  }
};
