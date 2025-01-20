import baseURL from "@/api/instance";
import { message } from "antd";
import Cookies from "js-cookie";

const token = Cookies.get("accessToken");
/**
 * Hàm createProduct tạo thêm API sản phẩm
 * @returns trả về toàn bộ sản phẩm
 * Auth: DMD, 11/1/2025
 */
const createProduct = async (product) => {
   const response = await baseURL.post("admin/products", product);
   return response;
};

/**
 * Hàm updateProduct cập nhật API sản phẩm
 * @returns trả về API đã cập nhật
 * Auth: DMD, 11/1/2025
 */
const updateProduct = async (id, product) => {
   const response = await baseURL.put(`admin/products/${id}`, product);
   return response;
};

/**
 * Hàm getAllProduct lấy toàn bộ sản phẩm
 * @returns trả về toàn bộ API
 * Auth: DMD, 11/1/2025
 */
const getAllProduct = async (
   search,
   currentPage = 0,
   pageSize = 4,
   categoryId = null,
   brandId = null
) => {
   let url = `admin/products?search=${search}&page=${currentPage}&size=${pageSize}`;
   // Thêm tham số categoryId nếu không phải là null
   if (categoryId !== null) {
      url += `&categoryId=${categoryId}`;
   }

   // Thêm tham số brandId nếu không phải là null
   if (brandId !== null) {
      url += `&brandId=${brandId}`;
   }

   // Gọi API
   const response = await baseURL.get(url);
   return response.data;
};

/**
 * Hàm getAllUserProduct lấy tất cả sản phẩm
 * @returns lấy tất cả sản phẩm bên user thành công
 * Auth: DMD, 16/1/2025
 */
const getAllUserProduct = async (
   search,
   currentPage = 0,
   pageSize = 8,
   categoryId = null
) => {
   let url = `admin/products?search=${search}&page=${currentPage}&size=${pageSize}`;
   // Thêm tham số categoryId nếu không phải là null
   if (categoryId !== null) {
      url += `&categoryId=${categoryId}`;
   }
   // Gọi API
   const response = await baseURL.get(url);
   return response.data;
};

/**
 * Hàm removeProduct xóa sản phẩm chỉ định
 * @returns xóa thành công
 * Auth: DMD, 11/1/2025
 */
const removeProduct = async (id) => {
   const response = await baseURL.delete(`admin/products/${id}`);
   return response;
};

const addColorToProduct = async (id, color) => {
   const response = await baseURL.post(`admin/products/${id}/colors`, color);
   return response;
};

const removeColorFromProduct = async (id, colorName) => {
   const response = await baseURL.delete(
      `admin/products/${id}/colors/${colorName}`
   );
   return response;
};

const updateColorToProduct = async (id, oldColorName, newColorName) => {
   const response = await baseURL.put(
      `admin/products/${id}/colors?oldColorName=${oldColorName}&newColorName=${newColorName}`
   );
   return response;
};

const addImageToProduct = async (id, image) => {
   const response = await baseURL.post(`admin/products/${id}/images`, image);
   return response;
};

const removeImageFromProduct = async (id, imageUrl) => {
   const encodedImageUrl = encodeURIComponent(imageUrl);
   const response = await baseURL.delete(
      `admin/products/${id}/images?imageUrl=${encodedImageUrl}`
   );
   return response;
};

const updateImageToProduct = async (id, oldImageName, newImageName) => {
   const decodedOldImageName = encodeURIComponent(oldImageName);
   const decodedNewImageName = encodeURIComponent(newImageName);
   const response = await baseURL.put(
      `admin/products/${id}/images?oldImageName=${decodedOldImageName}&newImageName=${decodedNewImageName}`
   );
   return response;
};

export {
   createProduct,
   getAllProduct,
   removeProduct,
   updateProduct,
   getAllUserProduct,
   addColorToProduct,
   removeColorFromProduct,
   updateColorToProduct,
   addImageToProduct,
   removeImageFromProduct,
   updateImageToProduct,
};
