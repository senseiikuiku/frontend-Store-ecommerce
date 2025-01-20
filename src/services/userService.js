import baseURL from "@/api/instance";
import { message } from "antd";
import Cookies from "js-cookie";

const token = Cookies.get("accessToken");

const getAllUsers = async (
   search,
   currentPage = 0,
   pageSize = 5,
   statusUser = null,
   gender = null
) => {
   let url = `admin/users?search=${search}&page=${currentPage}&size=${pageSize}`;
   // Thêm tham số statusUser nếu không phải là null
   if (statusUser !== null) {
      url += `&statusUser=${statusUser}`;
   }

   // Thêm tham số gender nếu không phải là null
   if (gender !== null) {
      url += `&gender=${gender}`;
   }

   // Gọi API
   const response = await baseURL.get(url);
   return response.data;
};

const getAllRoleName = async () => {
   const response = await baseURL.get("admin/users/roleName");
   return response.data;
};

const updateUser = async (id, value) => {
   const response = await baseURL.put(`admin/users/${id}`, value);
   return response;
};

/**
 * Hàm removeProduct xóa sản phẩm chỉ định
 * @returns xóa thành công
 * Auth: DMD, 14/1/2025
 */
const removeUser = async (id) => {
   const response = await baseURL.delete(`admin/users/${id}`);
   return response;
};

const findUserByEmail = async (email) => {
   const response = await baseURL.get(`admin/users/${email}`, {
      headers: {
         Authorization: `Bearer ${token}`, // Thêm token vào header
      },
   });
   return response.data;
};

const changePassByEmail = async (email, newPassword) => {
   const response = await baseURL.put(
      `admin/users/change-password/${email}`,
      null,
      {
         params: {
            newPassword: newPassword,
         },
         headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
         },
      }
   );

   return response.data;
};

const checkCurrentPassword = async (currentPassword, email) => {
   try {
      // Lấy accessToken từ cookie
      const response = await baseURL.put(
         `admin/users/check-password`, // API endpoint
         null, // Không có body, chỉ sử dụng params
         {
            params: {
               email: email, // Truyền email vào URL params
               inputPassword: currentPassword, // Truyền mật khẩu vào URL params
            },
            headers: {
               Authorization: `Bearer ${token}`, // Thêm token vào header
            },
         }
      );

      if (response.status === 200 && response.data === "Mật khẩu chính xác") {
         message.success("Mật khẩu đúng");
         return true;
      } else {
         message.error(response.data); // In ra thông báo nếu mật khẩu không đúng
         return false;
      }
   } catch (error) {
      // Xử lý lỗi khi gọi API
      message.error("Có lỗi xảy ra khi kiểm tra mật khẩu hiện tại");
      return false;
   }
};

const getCodeOTP = async (email) => {
   const response = await baseURL.post(`admin/users/OTP?email=${email}`);
   return response;
};

export {
   changePassByEmail,
   checkCurrentPassword,
   findUserByEmail,
   getAllUsers,
   removeUser,
   getAllRoleName,
   updateUser,
   getCodeOTP,
};
