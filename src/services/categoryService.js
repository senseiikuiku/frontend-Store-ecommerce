import baseURL from "@/api/instance";

/**
 * Hàm getAllCategory lấy toàn bộ danh mục từ API
 * @returns trả về toàn bộ danh mục cho sản phẩm
 * Auth: DMD, 11/1/2025
 */
const getAllCategory = async () => {
   // Gọi API
   const response = await baseURL.get("admin/categories/findAll");
   return response.data;
};

/**
 * Hàm getAllCategory lấy toàn bộ danh mục từ API
 * @returns trả về toàn bộ danh mục cho quản lý danh mục
 * Auth: DMD, 14/1/2025
 */
const getAllCategories = async (
   search,
   currentPage = 0,
   pageSize = 8,
   statusCategory = null,
   statusCategoryHasProduct = null
) => {
   // Gọi API
   // Tạo URL với các tham số
   let url = `admin/categories?search=${search}&page=${currentPage}&size=${pageSize}`;

   // Thêm tham số statusCategory nếu không phải là null
   if (statusCategory !== null) {
      url += `&statusCategory=${statusCategory}`;
   }
   // Thêm tham số statusCategoryHasProduct nếu không phải là null
   if (statusCategoryHasProduct !== null) {
      url += `&statusCategoryHasProduct=${statusCategoryHasProduct}`;
   }

   // Gọi API
   const response = await baseURL.get(url);
   return response.data;
};

/**
 * Hàm createCategory tạo thêm API danh mục
 * @returns thêm danh mục cho quản lý danh mục
 * Auth: DMD, 14/1/2025
 */
const createCategory = async (category) => {
   const response = await baseURL.post("admin/categories", category);

   return response;
};

const removeCategory = async (categoryId) => {
   const response = await baseURL.delete(`admin/categories/${categoryId}`);
   return response;
};

const updateCategory = async (id, category) => {
   const response = await baseURL.put(`admin/categories/${id}`, category);
   return response;
};

const getCategoriesWithProducts = async () => {
   const response = await baseURL.get(
      "admin/categories/categories-with-products"
   );
   return response;
};

export {
   getAllCategory,
   getAllCategories,
   createCategory,
   removeCategory,
   updateCategory,
   getCategoriesWithProducts,
};
