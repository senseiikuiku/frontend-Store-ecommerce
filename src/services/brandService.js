import baseURL from "@/api/instance";

/**
 * Hàm getAllBrand lấy toàn bộ thương hiệu từ API
 * @returns trả về toàn bộ thương hiệu cho sản phẩm
 * Auth: DMD, 19/1/2025
 */
const getAllBrand = async () => {
   const response = await baseURL.get("admin/brands/findAll");
   return response.data;
};

const getBrandsWithProducts = async () => {
   const response = await baseURL.get("admin/brands/brands-with-products");
   return response;
};

export { getAllBrand, getBrandsWithProducts };
