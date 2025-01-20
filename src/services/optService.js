// import baseURL from "@/api/instance";
// import { message } from "antd";

// const sendOtp = async (email) => {
//    try {
//       // Gửi yêu cầu đến API
//       const response = await baseURL.post(`admin/users/otp/${email}`);

//       // Hiển thị thông báo thành công
//       message.success("Mã OTP đã được gửi đến email của bạn.");
//       return response.data;
//    } catch (error) {
//       // Hiển thị thông báo lỗi nếu có lỗi
//       message.error("Không thể gửi mã OTP, vui lòng thử lại.");
//       console.error(
//          "Lỗi gửi mã OTP:",
//          error.response ? error.response.data : error.message
//       );
//       throw new Error("Không thể gửi mã OTP");
//    }
// };

// export { sendOtp };
