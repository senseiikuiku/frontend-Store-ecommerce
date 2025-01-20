import { Avatar, Button, Dropdown, Form, Input, Modal } from "antd";
import { Bell, Mail, Phone, UserRoundPen } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./header.css";
import {
   changePassByEmail,
   checkCurrentPassword,
} from "@/services/userService";
import { message } from "antd";
import { useDebounce } from "@/hooks/userDebounce";
import { handleEmailChange, handleNewPasswordChange } from "@/utils/validate";

export default function Header() {
   const [form] = Form.useForm();
   const [isShowModal, setIsShowModal] = useState(false);
   const [isShowInfoModal, setIsShowInfoModal] = useState(false);
   const [isShowChangePass, setIsShowChangePass] = useState(false);
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [emailStatus, setEmailStatus] = useState("");
   const [passwordStatus, setPasswordStatus] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");
   const emailRef = useRef(null);
   const [newPasswordStatus, setNewPasswordStatus] = useState("");
   const [checkRoleUser, setCheckRoleUser] = useState(false);

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogined =
      JSON.parse(localStorage.getItem("accountLogined")) || {};

   // Hàm kiểm tra Admin có vai trò ROLE_USER không
   const handleCheckROLEUSER = () => {
      // Kiểm tra xem user có phải là ADMIN không?
      const checkIsUser = accountLogined?.roles.some(
         (role) => role === "ROLE_USER"
      );
      if (checkIsUser) {
         setCheckRoleUser(true);
      }
   };

   // Chạy khi vào trang để kiểm tra admin có vai trò ROLE_USER không?
   useEffect(() => {
      handleCheckROLEUSER();
   }, []);

   // Hàm mở modal thông tin admin
   const handleShowInfoModal = () => {
      setIsShowInfoModal(true);
      // Truyền thông tin của admin vào các trường input
      if (accountLogined) {
         form.setFieldsValue(accountLogined);
      }
   };

   // Hàm đóng modal thông tin admin
   const handleCloseInfoModal = () => {
      setIsShowInfoModal(false);
   };

   // Hàm mở modal đổi mật khẩu
   const handleShowChangePass = () => {
      setIsShowChangePass(true);
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      form.resetFields();
      setTimeout(() => {
         if (emailRef.current) {
            emailRef.current.focus();
         }
      }, 100);
   };

   useEffect(() => {
      if (isShowChangePass && emailRef.current) {
         emailRef.current.focus();
      }
   }, [isShowChangePass]);

   // Hàm đóng modal đổi mật khẩu
   const handleCloseChangePass = () => {
      setIsShowChangePass(false);
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      form.resetFields();
   };

   // Hàm đổi mật khẩu
   const handleChangePass = async () => {
      try {
         const values = await form.validateFields();
         setLoading(true);

         const { email, password, newPassword } = values;

         if (newPassword === password) {
            message.error("Mật khẩu mới trung mới mật khẩu cũ");
            setLoading(false);
            return;
         }

         const isCurrentPasswordCorrect = await checkCurrentPassword(
            password,
            email
         );

         if (!isCurrentPasswordCorrect) {
            message.error("Mật khẩu hiện tại không đúng!");
            setLoading(false); // Dừng loading nếu mật khẩu sai
            return;
         }

         // Gọi API
         const response = await changePassByEmail(
            accountLogined.email,
            newPassword
         );

         if (response) {
            message.success("Đổi mật khẩu thành công!");
            handleCloseChangePass(); // Đóng modal sau khi đổi mật khẩu thành công
            setEmailStatus("");
            setPasswordStatus("");
            setNewPasswordStatus("");
            setIsShowChangePass(false);
            form.resetFields();
         } else {
            message.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
         setLoading(false);
      }
   };

   // Hàm mở modal xác nhận đăng xuất
   const handleShowModal = () => {
      setIsShowModal(true);
   };

   // Hàm đóng modal xác nhận đăng xuất
   const handleCloseModal = () => {
      setIsShowModal(false);
   };

   // Hàm đăng xuất tài khoản
   const handleLogout = () => {
      // Xóa token khỏi cookie
      Cookies.remove("accessToken");

      // Xóa dữ liệu từ localStorage
      localStorage.removeItem("accountLogined");

      // Chuyển hướng về trang đăng nhập
      navigate("/login");
   };

   // Các item profile người đăng nhập
   const items = [
      {
         label: <div onClick={handleShowInfoModal}>Thông tin cá nhân</div>,
         key: "0",
      },
      {
         label: <div onClick={handleShowChangePass}>Đổi mật khẩu</div>,
         key: "1",
      },
      {
         type: "divider",
      },
      {
         label: <div onClick={handleShowModal}>Đăng xuất</div>,
         key: "3",
      },
   ];

   // Hàm để lấy các chữ cái đầu của mỗi từ trong tên
   const getInitials = (fullName) => {
      const words = fullName?.split(" "); // Chia tên thành các từ
      const initials = words?.map((word) => word.charAt(0).toUpperCase()); // Lấy chữ cái đầu của mỗi từ và chuyển thành chữ hoa
      return initials?.join(""); // Kết hợp các chữ cái đầu thành chuỗi
   };

   // Ngăn chặn sự focus của label
   const handlePreventFocus = (e) => {
      e.preventDefault();
   };

   // Sử dụng useDebounce để debounce giá trị password
   const debouncedPassword = useDebounce(currentPassword, 800);

   // Hàm xử lý onChanePassword
   const handlePasswordChange = async (e) => {
      const password = e.target.value;
      setCurrentPassword(password);
   };

   // Hàm kiểm tra xem nhập password giống với password của email muốn đổi mk chưa
   useEffect(() => {
      const checkPassword = async () => {
         if (debouncedPassword) {
            const email = form.getFieldValue("email");
            if (!debouncedPassword) {
               setPasswordStatus("error");
               return;
            }
            try {
               // Gọi API kiểm tra mật khẩu
               const isPasswordCorrect = await checkCurrentPassword(
                  debouncedPassword,
                  email
               );
               if (isPasswordCorrect) {
                  setPasswordStatus("success");
               } else {
                  setPasswordStatus("error");
               }
            } catch (error) {
               setPasswordStatus("error");
            }
         }
      };

      checkPassword();
   }, [debouncedPassword]);

   return (
      <>
         {/* Show thông báo đổi mật khẩu */}
         <Modal
            open={isShowChangePass}
            onCancel={handleCloseChangePass}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseChangePass}>Hủy</Button>
                  <Button
                     onClick={handleChangePass}
                     type="primary"
                     danger
                     loading={loading}
                  >
                     Lưu
                  </Button>
               </div>
            }
         >
            <Form
               form={form}
               requiredMark={false}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  validateStatus={emailStatus}
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
                     autoComplete="email"
                     ref={emailRef}
                     onChange={(e) => handleEmailChange(e, setEmailStatus)}
                  />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus={passwordStatus}
                  label={<div className="font-bold">Mật khẩu hiện tại</div>}
                  name="password"
                  rules={[
                     {
                        required: true,
                        message: "Password không được bỏ trống",
                     },
                  ]}
               >
                  <Input.Password
                     value={currentPassword}
                     onChange={handlePasswordChange}
                  />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus={newPasswordStatus}
                  label={<div className="font-bold">Mật khẩu mới</div>}
                  name="newPassword"
                  rules={[
                     {
                        required: true,
                        message: "Password mưới không được để trống",
                     },
                     {
                        pattern: /^[A-Za-z0-9]{5,}$/,
                        message:
                           "Password phải từ 5 ký tự trở lên và không có ký tự đặc biệt hoặc khoảng trắng",
                     },
                  ]}
               >
                  <Input.Password
                     onChange={(e) =>
                        handleNewPasswordChange(
                           e.target.value,
                           setNewPasswordStatus
                        )
                     }
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Show thông tin của admin */}
         <Modal
            footer={null}
            onCancel={handleCloseInfoModal}
            open={isShowInfoModal}
         >
            <Form
               color="red"
               requiredMark={false}
               form={form}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  validateStatus="success"
                  label={
                     <div onClick={handlePreventFocus} className="font-bold">
                        Email
                     </div>
                  }
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: "Email không được bỏ trống",
                     },
                  ]}
               >
                  <Input
                     prefix={<Mail className="size-5 text-slate-600" />}
                     className="select-none"
                  />
               </Form.Item>
               <Form.Item
                  hasFeedback
                  validateStatus="success"
                  label={
                     <div onClick={handlePreventFocus} className="font-bold">
                        Full name
                     </div>
                  }
                  name="fullName"
                  rules={[
                     {
                        required: true,
                        message: "Tên không được để trống",
                     },
                  ]}
               >
                  <Input
                     prefix={<UserRoundPen className="size-5 text-slate-600" />}
                     className="select-none"
                  />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus="success"
                  label={
                     <div onClick={handlePreventFocus} className="font-bold">
                        Phone
                     </div>
                  }
                  name="phone"
                  rules={[
                     {
                        required: true,
                        message: "Số điện thoại không được để trống",
                     },
                  ]}
               >
                  <Input
                     prefix={<Phone className="size-5 text-slate-600" />}
                     className="select-none font-normal text-red-400"
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Show thông báo muốn đăng xuất không */}
         <Modal
            onCancel={handleCloseModal}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModal}>Hủy</Button>
                  <Button onClick={handleLogout} type="primary" danger>
                     Đăng xuất
                  </Button>
               </div>
            }
            title="Xác nhận"
            open={isShowModal}
         >
            <p>Bạn có chắc chắn muốn đăng xuất không?</p>
         </Modal>
         {/* Giao diện header */}
         <header className="w-full h-16 bg-[#092324] flex justify-between items-center px-12">
            <div>
               <a href="#">
                  <img
                     src="../src/assets/img/logo.png"
                     className="size-12"
                     id="#!"
                     alt="logo"
                  />
               </a>
            </div>
            <div className="flex items-center gap-5">
               {checkRoleUser ? (
                  <Button
                     onClick={() => navigate("/user")}
                     type="primary"
                     ghost
                  >
                     Qua trang USER
                  </Button>
               ) : (
                  ""
               )}
               <Dropdown
                  className="cursor-pointer"
                  placement="bottom"
                  trigger={["click", "hover"]}
                  arrow
                  menu={{ items }}
               >
                  <Bell className="cursor-pointer text-white" />
               </Dropdown>
               {/* Thông tin của Admin đăng nhập */}
               <Dropdown
                  className="cursor-pointer"
                  placement="bottomLeft"
                  arrow
                  menu={{
                     items,
                  }}
                  trigger={["click"]}
               >
                  <Avatar className="bg-orange-400">
                     {getInitials(accountLogined?.fullName)}
                  </Avatar>
               </Dropdown>
            </div>
         </header>
      </>
   );
}
