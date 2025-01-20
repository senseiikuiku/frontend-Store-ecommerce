import { Button, Form, Input, message, Modal } from "antd";
import { HttpStatusCode } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { login } from "@/services/authService";
import { LockKeyhole, UserRound } from "lucide-react";
import { decryptData, encryption, encryptPassword } from "@/utils/CryptoJS ";
import bcrypt from "bcryptjs";
import {
   changePassByEmail,
   findUserByEmail,
   getCodeOTP,
} from "@/services/userService";
import { handleEmailChange, handlePasswordChange } from "@/utils/validate";
// import { sendOtp } from "@/services/optService";

// Cú pháp lưu cookie và lấy cookie

export default function Login() {
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const emailRef = useRef(null);
   const emailRefForgotPass = useRef(null);
   const otpRef = useRef(null);
   const [rememberAccount, setRememberAccount] = useState(false);
   const [form] = Form.useForm(); // Form cho chức năng chính
   const [formEmail] = Form.useForm(); // Form cho email
   const [formForgotPassword] = Form.useForm(); // Form cho chức năng mật khẩu
   const [isShowForgotPassword, setIsShowForgotPassword] = useState(false);
   const [isShowOPT, setIsShowOPT] = useState(false);
   const [isLoadingForgotPass, setIsLoadingForgotPass] = useState(false);
   const [emailStatus, setEmailStatus] = useState("");
   const [valueEmail, setValueEmail] = useState("");
   const [passStatus, setPassStatus] = useState("");
   const [valuePass, setValuePass] = useState("");
   const [valueOTP, setValueOTP] = useState("");
   const [isOTPLoading, setIsOTPLoading] = useState(false);
   const [emailOTPStatus, setEmailOTPStatus] = useState("");
   const [passOTPStatus, setPassOTPStatus] = useState("");
   const [rePassOTPStatus, setRePassOTPStatus] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");

   // Tự focus vào email khi vào trang login và tự động điền giá trị nếu trong localStorage đã có savedAccount khi nhấn "Nhớ tài khoản"
   useEffect(() => {
      const savedAccount = JSON.parse(localStorage.getItem("savedAccount"));
      if (savedAccount) {
         // Giải mã email và password trước khi điền vào form
         const decryptedEmail = decryptData(savedAccount.email);
         setValueEmail(decryptedEmail);

         const beforeEncryption = sessionStorage.getItem("beforeEncryption");
         // So sánh mật khẩu đã mã hóa (beforeEncryption.current) với mật khẩu lưu trong savedAccount
         bcrypt
            .compare(beforeEncryption, savedAccount.password)
            .then((isPasswordCorrect) => {
               if (isPasswordCorrect) {
                  // Giải mã mật khẩu sau khi xác nhận đúng mật khẩu
                  const decryptedPassword = decryptData(beforeEncryption);
                  setValuePass(decryptedPassword);
                  // Cập nhật giá trị vào form
                  form.setFieldsValue({
                     email: decryptedEmail,
                     password: decryptedPassword,
                  });
               } else {
                  form.setFieldsValue({
                     email: decryptedEmail,
                     password: "", // Đảm bảo mật khẩu không bị hiển thị
                  });
               }
            })
            .catch((err) => {
               // Cập nhật giá trị vào form
               form.setFieldsValue({
                  email: decryptedEmail,
                  password: "",
               });
            });

         setRememberAccount(true); //Đặt trạng thái checkbox về true
      }
      if (emailRef.current) {
         emailRef.current.focus();
      }
   }, []);

   // Kiểm tra xem người dùng đã đăng nhập chưa, nếu rồi thì quay lại trang chủ
   useEffect(() => {
      // kiểm tra token từ cookie
      const accessToken = Cookies.get("accessToken");

      const accountLogined =
         JSON.parse(localStorage.getItem("accountLogined")) || {};

      if (accessToken) {
         const checkIsAdmin = accountLogined?.roles?.some(
            (role) => role === "ROLE_ADMIN"
         );
         if (checkIsAdmin) {
            navigate("/admin");
         } else {
            navigate("/user");
         }
      }
   }, []);

   // Hàm xác định đăng nhập
   const onFinish = async (values) => {
      try {
         // Hiển thị loading
         setIsLoading(true);

         // Gọi API
         const response = await login(values);

         // Dùng destructring để lấy ra các key của object
         const { accessToken, ...filtedData } = response;

         // Lưu token lên cookie hoặc local
         Cookies.set("accessToken", accessToken, {
            expires: 1,
            secure: true,
            sameSite: "strict",
         });

         // Lưu thông tin cá nhân của user đã đăng nhập lên localStorage
         localStorage.setItem("accountLogined", JSON.stringify(filtedData));

         // Chuyển trang dựa vào quyền hạn
         // Kiểm tra xem user có phải là ADMIN không?
         const checkIsAdmin = filtedData?.roles.some(
            (role) => role === "ROLE_ADMIN"
         );

         // Khi nhấn ghi "nhớ tài khoản"
         if (rememberAccount) {
            // Mã hóa email
            const encryptedEmail = encryption(values.email);
            // Mã hóa mật khẩu nhẹ
            const lightEncryption = encryption(values.password);
            // Lưu giá trị beforeEncryption vào sessionStorage
            sessionStorage.setItem("beforeEncryption", lightEncryption);
            // Mã hóa mật khẩu trước khi gửi tới server
            const encryptedPassword = await encryptPassword(lightEncryption);
            // Lưu vào localStorage khi nhấn "Nhớ tài khoản"
            localStorage.setItem(
               "savedAccount",
               JSON.stringify({
                  email: encryptedEmail, // Lưu mật email đã mã hóa
                  password: encryptedPassword, // Lưu mật khẩu đã mã hóa
               })
            );
         } else {
            // Xóa khỏi localStorage
            localStorage.removeItem("savedAccount");
         }

         // .....Kiểm tra các quyền còn lại

         if (checkIsAdmin) {
            // Điều hướng về trang admin
            navigate("/admin");
         } else {
            // Điều hướng về trang user
            navigate("/user");
         }

         // Hiển thị thông báo đăng nhập thành công
         message.success("Đăng nhập thành công");
      } catch (error) {
         if (error?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data?.error);
            return;
         } else {
            message.error("Máy chủ đang gặp sự cố. Vui lòng thử lại sau!");
            return;
         }
      } finally {
         // Tắt loading
         setIsLoading(false);
      }
   };

   // Hàm mở quên mật khẩu
   const handleForgotPassword = () => {
      setIsShowForgotPassword(true);
      formEmail.resetFields();
      setEmailOTPStatus("");
      setTimeout(() => {
         if (emailRefForgotPass.current) {
            emailRefForgotPass.current.focus();
         }
      }, 100);
   };

   useEffect(() => {
      if (isShowForgotPassword && emailRefForgotPass.current) {
         emailRefForgotPass.current.focus();
      }
   }, [isShowForgotPassword]);

   // Hàm đóng quên mật khẩu
   const handleCloseForgotPassword = () => {
      setIsShowForgotPassword(false);
      formEmail.resetFields();
      setEmailOTPStatus("");
   };

   // Hàm lưu email vào cookie
   const saveEmailToCookie = (email) => {
      Cookies.set("email", email, {
         expires: 1, // Cookie hết hạn sau 1 ngày
         secure: true, // Giới hạn truy cập cookie chỉ qua https
         sameSite: "strict", // Giới hạn cookie chỉ gửi trong cùng miền
      });
   };

   // Hàm xử lý quên mật khẩu
   const handleGetPassword = async () => {
      try {
         const values = await formEmail.validateFields();
         const { email } = values;

         setIsLoadingForgotPass(true);

         // Gọi API
         const response = await findUserByEmail(email);
         if (response) {
            // Lưu email lên cookie
            saveEmailToCookie(email);
            message.success("Qua bước xác nhận OPT!");
            handleCloseForgotPassword();
            handleOpenOPT();
            formEmail.resetFields();
         } else {
            message.error("Email không xác nhận vui lòng thử lại!");
         }
      } catch (error) {
         message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
         setIsLoadingForgotPass(false);
      }
   };

   // Hàm mở mã OPT và lấy mk
   const handleOpenOPT = async () => {
      setIsShowOPT(true);

      const email = Cookies.get("email");
      const response = await getCodeOTP(email);

      setValueOTP(response.data.otp);
      setEmailOTPStatus("");
      setPassOTPStatus("");
      setRePassOTPStatus("");
      formForgotPassword.resetFields();

      setTimeout(() => {
         if (otpRef.current) {
            otpRef.current.focus();
         }
      }, 100);
   };

   // Tự focus vào input OTP
   useEffect(() => {
      if (otpRef.current) {
         otpRef.current.focus();
      }
   }, []);

   // Hàm đóng mã OPT và lấy mk
   const handlCloseOPT = () => {
      setIsShowOPT(false);
      setEmailOTPStatus("");
      setPassOTPStatus("");
      setRePassOTPStatus("");
      formForgotPassword.resetFields();
   };

   // Hàm xác nhận mã OPT và lấy mk
   const handleConfirmOPT = async () => {
      const email = Cookies.get("email"); // Lấy email từ cookie
      const values = await formForgotPassword.validateFields();
      const { opt, newPassword, rePassword } = values; // Lấy các giá trị từ form

      // Kiểm tra mã OTP
      if (opt !== valueOTP) {
         // Nếu mã OTP không chính xác
         message.error("Mã OTP không chính xác");
         return;
      }

      // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp không
      if (newPassword !== rePassword) {
         // Nếu mật khẩu và xác nhận mật khẩu không giống nhau
         message.error("Mật khẩu xác nhận không đúng");
         return;
      }

      // Gọi API để thay đổi mật khẩu
      try {
         setIsOTPLoading(true);
         const response = await changePassByEmail(email, newPassword); // Gọi API thay đổi mật khẩu
         console.log("response: ", response);

         if (response) {
            // Nếu đổi mật khẩu thành công
            message.success("Mật khẩu đã được lấy lại thành công");
            handlCloseOPT();
            setEmailOTPStatus("");
            setPassOTPStatus();
            setRePassOTPStatus();
         } else {
            // Nếu có lỗi khi thay đổi mật khẩu
            message.error("Đã xảy ra lỗi khi thay lấy lại mật khẩu");
         }
      } catch (error) {
         // Xử lý lỗi nếu có
         message.error("Đã xảy ra lỗi, vui lòng thử lại sau");
         console.error(error);
      } finally {
         setIsOTPLoading(false);
      }
   };

   // Chuyển qua trang đăng ký tài khoản
   const handleNextPageResgiter = () => {
      navigate("/register");
   };

   // gọi lại handleEmailChange khi dữ liệu email thay đổi hoặc handlePasswordChange khi dữ liệu email thay
   useEffect(() => {
      if (valueEmail) {
         handleEmailChange({ target: { value: valueEmail } }, setEmailStatus);
      }
      if (valuePass) {
         handlePasswordChange({ target: { value: valuePass } }, setPassStatus);
      }
   }, [valueEmail, valuePass]); // Chạy lại mỗi khi valueEmail hoặc valuePass thay đổi

   const handleRePassword = (e) => {
      const rePassword = e.target.value;
      setCurrentPassword(rePassword);
      const password = formForgotPassword.getFieldValue("newPassword");
      console.log("password ", password);

      if (!rePassword) {
         setRePassOTPStatus("");
      } else if (rePassword === password) {
         setRePassOTPStatus("success");
      } else {
         setRePassOTPStatus("error");
      }
   };
   console.log("currentPassword ", currentPassword);

   return (
      <>
         {/* Giao diện xác nhận mã OTP */}
         <Modal
            open={isShowOPT}
            onCancel={handlCloseOPT}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handlCloseOPT}>Đóng</Button>
                  <Button
                     loading={isOTPLoading}
                     onClick={handleConfirmOPT}
                     type="primary"
                  >
                     Xác nhận
                  </Button>
               </div>
            }
         >
            <Form
               form={formForgotPassword}
               requiredMark={false}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  label={<div className="font-bold">Mã OTP</div>}
                  name="opt"
                  rules={[
                     {
                        required: true,
                        message: "Mã OPT không được bỏ trống",
                     },
                  ]}
               >
                  <Input ref={otpRef} />
               </Form.Item>
               <Form.Item
                  hasFeedback
                  validateStatus={passOTPStatus}
                  label={<div className="font-bold">Mật khẩu mới</div>}
                  name="newPassword"
                  rules={[
                     {
                        required: true,
                        message: "Password không được bỏ trống",
                     },
                     {
                        pattern: /^[A-Za-z0-9]{5,}$/,
                        message:
                           "Password phải từ 5 ký tự trở lên, không lấy kí tự đặc biệt",
                     },
                  ]}
               >
                  <Input.Password
                     onChange={(e) => handlePasswordChange(e, setPassOTPStatus)}
                     placeholder="Nhập password mới"
                  />
               </Form.Item>
               <Form.Item
                  hasFeedback
                  validateStatus={rePassOTPStatus}
                  label={<div className="font-bold">Viết lại mật khẩu</div>}
                  name="rePassword"
                  rules={[
                     {
                        required: true,
                        message: "Viết lại password",
                     },
                     {
                        pattern: /^[A-Za-z0-9]{5,}$/,
                        message: "Password phải từ 5 ký tự trở lên",
                     },
                  ]}
               >
                  <Input.Password
                     value={currentPassword}
                     onChange={handleRePassword}
                     placeholder="Nhập lại password"
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện quên mật khẩu */}
         <Modal
            open={isShowForgotPassword}
            onCancel={handleCloseForgotPassword}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseForgotPassword}>Đóng</Button>
                  <Button
                     onClick={handleGetPassword}
                     type="primary"
                     loading={isLoadingForgotPass}
                  >
                     Gửi
                  </Button>
               </div>
            }
         >
            <Form
               form={formEmail}
               requiredMark={false}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  validateStatus={emailOTPStatus}
                  label={<div className="font-bold">email</div>}
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: "email không được bỏ trống",
                     },
                     {
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "email không hợp lệ",
                     },
                  ]}
               >
                  <Input
                     onChange={(e) => handleEmailChange(e, setEmailOTPStatus)}
                     placeholder="Email"
                     autoComplete="email"
                     ref={emailRefForgotPass}
                  />
               </Form.Item>
            </Form>
         </Modal>

         <div className="h-screen flex justify-center items-center">
            <div className="w-[450px] border px-6 py-5 rounded-lg shadow-sm bg-slate-100">
               <header className="text-center font-semibold text-[24px] mb-6">
                  <h3>Đăng nhập tài khoản </h3>
               </header>

               <Form
                  form={form}
                  layout="vertical"
                  name="basic"
                  onFinish={onFinish}
                  autoComplete="off"
               >
                  <Form.Item
                     hasFeedback
                     validateStatus={emailStatus}
                     label={<span className="font-semibold">Email</span>}
                     name="email"
                     rules={[
                        {
                           required: true,
                           message: "Email không được để trống",
                        },
                        {
                           pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                           message: "email không hợp lệ",
                        },
                     ]}
                  >
                     <Input
                        prefix={<UserRound className="size-4" />}
                        placeholder="Email"
                        className="h-10"
                        autoComplete="email"
                        ref={emailRef} // Gán ref cho trường email
                        value={valueEmail}
                        onChange={(e) => handleEmailChange(e, setEmailStatus)}
                     />
                  </Form.Item>

                  <Form.Item
                     hasFeedback
                     validateStatus={passStatus}
                     label={<span className="font-semibold">Mật khẩu</span>}
                     name="password"
                     rules={[
                        {
                           required: true,
                           message: "Mật khẩu không được để trống",
                        },
                        {
                           pattern: /^[A-Za-z0-9]{5,}$/,
                           message: "Password phải từ 5 ký tự trở lên",
                        },
                     ]}
                  >
                     <Input.Password
                        prefix={<LockKeyhole className="size-4" />}
                        placeholder="Password"
                        className="h-10"
                        value={valuePass}
                        onChange={(e) => handlePasswordChange(e, setPassStatus)}
                     />
                  </Form.Item>

                  <Form.Item>
                     <div className="text-center flex justify-between">
                        <Link
                           onClick={handleForgotPassword}
                           className="underline font-[500]"
                        >
                           Quên mật khẩu
                        </Link>
                        <div className="flex gap-1 justify-center items-center">
                           <Input
                              className="w-fit h-full"
                              type="checkbox"
                              checked={rememberAccount}
                              onChange={(e) =>
                                 setRememberAccount(e.target.checked)
                              }
                           />
                           <p className="italic font-normal">Nhớ mật khẩu</p>
                        </div>
                     </div>
                  </Form.Item>

                  <Form.Item label={null}>
                     <Button
                        loading={isLoading}
                        className="w-full h-10"
                        type="primary"
                        htmlType="submit"
                     >
                        Đăng nhập
                     </Button>
                  </Form.Item>
                  <div className="flex justify-center">
                     <Link
                        onClick={handleNextPageResgiter}
                        className="underline font-[500]"
                     >
                        Đăng ký tài khoản
                     </Link>
                  </div>
               </Form>
            </div>
         </div>
      </>
   );
}
