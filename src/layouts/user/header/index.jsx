import {
   Avatar,
   Button,
   Dropdown,
   Form,
   Input,
   message,
   Modal,
   Select,
} from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./header.css";
import { Mail, Phone, UserRoundPen } from "lucide-react";
import {
   changePassByEmail,
   checkCurrentPassword,
   findUserByEmail,
   updateUser,
} from "@/services/userService";
import { HttpStatusCode } from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/userDebounce";
import { handleEmailChange, handleNewPasswordChange } from "@/utils/validate";
import { getCategoriesWithProducts } from "@/services/categoryService";
import { HeaderContext } from "@/providers/userHeaderProvider";

export default function Header() {
   const {
      searchValue,
      setSearchValue,
      selectedCategory,
      setSelectedCategory,
   } = useContext(HeaderContext);

   const [isShowInfoModal, setIsShowInfoModal] = useState(false);
   const [valueInfoEmail, setValueInfoEmail] = useState(null);
   const [valueInfoName, setValueInfoName] = useState(null);
   const [valueInfoPhone, setValueInfoPhone] = useState(null);
   const [isShowEditModal, setIsShowEditModal] = useState(false);
   const [isEditLoading, setIsEditloading] = useState(false);
   const [isInfoLoading, setIsInfoLoading] = useState(false);
   const [isShowLogout, setIsShowLogout] = useState(false);
   const [user, setUser] = useState({});
   const [form] = Form.useForm();
   const [formChangePass] = Form.useForm();
   const [formEdit] = Form.useForm();
   const nameRef = useRef();
   const [baseId, setBaseId] = useState(null);
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [emailStatus, setEmailStatus] = useState("");
   const [passwordStatus, setPasswordStatus] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");
   const emailRef = useRef(null);
   const [newPasswordStatus, setNewPasswordStatus] = useState("");
   const [isShowChangePass, setIsShowChangePass] = useState(false);
   const [checkRoleAdmin, setCheckRoleAdmin] = useState(false);
   const [categories, setCategories] = useState([]);
   const [isShowAbout, setIsShowAbout] = useState(false);
   const [searchValueProduct, setSearchValueProduct] = useState(searchValue);
   const [selectedCategoryUser, setSelectedCategoryUser] =
      useState(selectedCategory);

   // Cập nhật searchValue trong HeaderContext khi searchValueProduct thay đổi
   useEffect(() => {
      setSearchValue(searchValueProduct);
   }, [searchValueProduct, setSearchValue]);

   // Cập nhật selectedCategory trong HeaderContext khi selectedCategoryUser thay đổi
   useEffect(() => {
      setSelectedCategory(selectedCategoryUser);
   }, [selectedCategoryUser, setSelectedCategory]);

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogined =
      JSON.parse(localStorage.getItem("accountLogined")) || {};

   // Hàm kiểm tra User có vai trò ROLE_Admin không
   const handleCheckROLEADMIN = () => {
      // Kiểm tra xem user có phải là ADMIN không?
      const checkIsAdmin = accountLogined?.roles.some(
         (role) => role === "ROLE_ADMIN"
      );
      if (checkIsAdmin) {
         setCheckRoleAdmin(true);
      }
   };

   // Chạy khi vào trang để kiểm tra admin có vai trò ROLE_USER không?
   useEffect(() => {
      handleCheckROLEADMIN();
   }, []);

   // Tự chạy khi accountLogined thay đổi
   useEffect(() => {
      if (accountLogined) {
         setValueInfoEmail(accountLogined.email);
         setValueInfoName(accountLogined.name);
         setValueInfoPhone(accountLogined.phone);
      }
   }, [accountLogined]);

   // Hàm mở modal thông tin
   const handleShowInfoModal = () => {
      setIsShowInfoModal(true);

      // Truyền thông tin của admin vào các trường input
      if (accountLogined) {
         form.setFieldsValue(accountLogined);
      }
   };

   // Hàm đóng modal thông tin
   const handleCloseInfoModal = () => {
      setIsShowInfoModal(false);
   };

   // Hàm mở modal cập nhật
   const handleshowEditModal = () => {
      setIsShowEditModal(true);

      setIsShowInfoModal(false);
      // Lấy id của user
      setBaseId(user.id);

      formEdit.setFieldsValue(user);

      setTimeout(() => {
         if (nameRef.current) nameRef.current.focus();
      }, 100);
   };

   // Tự động focus vào input name
   useEffect(() => {
      if (nameRef.current) {
         nameRef.current.focus();
      }
   }, []);

   // Hàm đóng modal cập nhật
   const handleCLoseEditModal = () => {
      setIsShowEditModal(false);

      // reset base
      setBaseId(null);
   };

   // Lấy dữ liệu tài khoản bởi email
   const fetchUser = async () => {
      setIsInfoLoading(true);
      const response = await findUserByEmail(accountLogined.email);

      setUser(response);

      setIsInfoLoading(false);
   };

   // Hàm lấy dữ liệu danh mục
   const fetchCategories = async () => {
      const response = await getCategoriesWithProducts();
      setCategories(response.data);
   };

   // Sẽ gọi mỗi khi vào trang user
   useEffect(() => {
      fetchCategories();
      fetchUser();
   }, []);

   // Hàm xử lý cập nhật modal
   const onFinish = async (values) => {
      try {
         // Cập nhật trạng thái cho người dùng
         values.status = true;

         setIsEditloading(true);
         const response = await updateUser(baseId, values);
         if (response.status === 200) {
            handleCLoseEditModal();
            fetchUser();
            if (accountLogined) {
               // Cập nhật các trường có sẵn
               const updatedAccount = {
                  ...accountLogined,
                  fullName: values.fullName || accountLogined.fullName,
                  email: values.email || accountLogined.email,
                  phone: values.phone || accountLogined.phone,
                  address: values.address || accountLogined.address,
                  status: true,
               };

               // Lưu lại dữ liệu đã cập nhật vào Local Storage
               localStorage.setItem(
                  "accountLogined",
                  JSON.stringify(updatedAccount)
               );
               message.success("Lưu trên hệ thống thành công");
            } else {
               message.error("Lưu trên hệ thống thất bại!");
            }
            setBaseId(null);
            message.success("Cập nhật thông tin thành công");
         } else {
            message.error("Cập nhật thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         if (error.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data);
         } else {
            message.error("Có xảy ra lỗi, vui lòng thử lại sau!");
         }
      } finally {
         setIsEditloading(false);
      }
   };

   // Hàm mở modal đổi mật khẩu
   const handleShowChangePass = () => {
      setIsShowChangePass(true);
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      formChangePass.resetFields();
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
      formChangePass.resetFields();
   };

   // Hàm đổi mật khẩu
   const handleChangePass = async () => {
      try {
         const values = await formChangePass.validateFields();
         setLoading(true);

         const { email, password, newPassword } = values;

         if (newPassword === password) {
            message.error("Mật khẩu mới trùng với mật khẩu cũ");
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
            formChangePass.resetFields();
         } else {
            message.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
         setLoading(false);
      }
   };

   // Sử dụng useDebounce để debounce giá trị password
   const debouncedPassword = useDebounce(currentPassword, 800);

   // Hàm xử lý onChanePassword
   const handlePasswordChange = async (e) => {
      const password = e.target.value;
      setCurrentPassword(password);
   };

   useEffect(() => {
      const checkPassword = async () => {
         if (debouncedPassword) {
            const email = formChangePass.getFieldValue("email");
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

   // Hàm mở modal đăng xuất
   const handleShowModalLogout = () => {
      setIsShowLogout(true);
   };

   // Hàm đóng modal đăng xuất
   const handleCloseModalLogout = () => {
      setIsShowLogout(false);
   };

   // Hàm xử lý logout
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
         label: <div onClick={handleShowModalLogout}>Đăng xuất</div>,
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

   // Hàm mở modal about
   const handleShowAbout = () => {
      setIsShowAbout(true);
   };

   // Hàm đóng modal about
   const handleCloseAbout = () => {
      setIsShowAbout(false);
   };

   return (
      <>
         {/* Giao diện trang about */}
         <Modal
            width={700}
            closeIcon={false}
            title=""
            onCancel={handleCloseAbout}
            open={isShowAbout}
            footer={false}
            className="custom-modal"
         >
            <div>
               {/* Header */}
               <div className="modal-header">
                  <h1 className="modal-title">
                     Hỗ Trợ Khách Hàng - Grocerymart
                  </h1>
               </div>

               {/* Navigation */}
               <div className="modal-nav">
                  <a href="#faq" className="modal-link">
                     Câu hỏi thường gặp
                  </a>
                  <a href="#shipping" className="modal-link">
                     Vận chuyển
                  </a>
                  <a href="#returns" className="modal-link">
                     Đổi trả và hoàn tiền
                  </a>
                  <a href="#contact" className="modal-link">
                     Liên hệ chúng tôi
                  </a>
               </div>
            </div>

            {/* FAQ Section */}
            <section id="faq" className="modal-section">
               <h2 className="section-title">Câu hỏi thường gặp</h2>
               <p>
                  <strong>1. Làm thế nào để đặt hàng?</strong>
                  <br />
                  Để đặt hàng, hãy thêm sản phẩm vào giỏ hàng và nhấp vào nút
                  "Thanh toán".
               </p>
               <p>
                  <strong>
                     2. Làm thế nào để kiểm tra trạng thái đơn hàng?
                  </strong>
                  <br />
                  Bạn có thể kiểm tra trạng thái đơn hàng trong tài khoản của
                  bạn hoặc liên hệ với chúng tôi qua trang Liên hệ.
               </p>
               <p>
                  <strong>3. Làm thế nào để thay đổi thông tin cá nhân?</strong>
                  <br />
                  Bạn có thể cập nhật thông tin cá nhân trong phần Tài khoản của
                  bạn.
               </p>
            </section>

            {/* Shipping Section */}
            <section id="shipping" className="modal-section">
               <h2 className="section-title">Thông tin Vận chuyển</h2>
               <p>
                  Chúng tôi cung cấp các tùy chọn vận chuyển nhanh chóng và đáng
                  tin cậy. Chi phí vận chuyển và thời gian giao hàng cụ thể sẽ
                  hiển thị trong quá trình thanh toán.
               </p>
               <p>
                  <strong>Phí Vận chuyển:</strong> Phí vận chuyển được tính dựa
                  trên địa chỉ giao hàng của bạn.
               </p>
               <p>
                  <strong>Thời Gian Giao Hàng:</strong> Thời gian giao hàng ước
                  tính sẽ được hiển thị trong quá trình thanh toán.
               </p>
            </section>

            {/* Returns Section */}
            <section id="returns" className="modal-section">
               <h2 className="section-title">
                  Chính sách Đổi trả và Hoàn tiền
               </h2>
               <p>
                  Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày mua.
                  Để đổi trả, vui lòng liên hệ với chúng tôi qua trang Liên hệ.
               </p>
               <p>
                  <strong>Điều Kiện Đổi Trả:</strong> Sản phẩm phải còn nguyên
                  vẹn, chưa sử dụng và có các nhãn mác gốc.
               </p>
               <p>
                  <strong>Hoàn Tiền:</strong> Hoàn tiền sẽ được xử lý trong vòng
                  7-10 ngày làm việc sau khi nhận được sản phẩm đổi trả.
               </p>
            </section>

            {/* Contact Section */}
            <section id="contact" className="modal-section">
               <h2 className="section-title">Liên hệ chúng tôi</h2>
               <p>
                  Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, hãy liên hệ với
                  chúng tôi qua email:
                  <a href="mailto:support@example.com" className="contact-link">
                     support@example.com
                  </a>
               </p>
               <p>
                  Hoặc gọi đến số điện thoại hỗ trợ của chúng tôi:
                  <strong>(123) 456-7890</strong>.
               </p>
               <p>
                  Chúng tôi cũng có thể được liên hệ qua mạng xã hội:
                  <a href="#" className="contact-link">
                     Facebook
                  </a>
                  ,{" "}
                  <a href="#" className="contact-link">
                     Twitter
                  </a>
                  .
               </p>
            </section>

            {/* Footer */}
            <div className="custom-footer">
               <p>&copy; 2023 Tên Trang Web. Bản quyền thuộc về chúng tôi.</p>
            </div>
         </Modal>

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
               form={formChangePass}
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

         {/* Giao diện cập nhật thông tin người dùng */}
         <Modal
            loading={isInfoLoading}
            footer={false}
            open={isShowEditModal}
            title="Cập nhật tài khoản"
            onCancel={handleCLoseEditModal}
         >
            <Form
               form={formEdit}
               name="Cập nhật thông tin"
               layout="vertical"
               onFinish={onFinish}
               autoComplete="off"
            >
               <Form.Item
                  label="Tên người dùng"
                  name="fullName"
                  rules={[
                     {
                        required: true,
                        message: "Tên người dùng không bỏ trống",
                     },
                  ]}
               >
                  <Input ref={nameRef} />
               </Form.Item>

               <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: "email không bỏ trống",
                     },
                  ]}
               >
                  <Input placeholder="Nhập email" />
               </Form.Item>

               <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                     {
                        required: true,
                        message: "Số điện thoại không để trống",
                     },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                     {
                        required: true,
                        message: "Giới tính không bỏ trống",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn giới tính"
                     style={{ width: 150 }}
                     options={[
                        { value: "MALE", label: "Nam" },
                        { value: "FEMALE", label: "Nữ" },
                        { value: "OTHER", label: "Khác" },
                     ]}
                  />
               </Form.Item>

               <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[
                     {
                        required: true,
                        message: "Địa chỉ không bỏ trống",
                     },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCLoseEditModal}
                        type="primary"
                        danger
                        ghost
                        htmlType="button"
                     >
                        Đóng
                     </Button>
                     <Button
                        loading={isEditLoading}
                        type="primary"
                        htmlType="submit"
                     >
                        Lưu
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện hiển thị thông tin */}
         <Modal
            open={isShowInfoModal}
            onCancel={handleCloseInfoModal}
            footer={
               <div className="flex gap-2 justify-end">
                  <Button
                     onClick={handleCloseInfoModal}
                     type="primary"
                     danger
                     ghost
                  >
                     Đóng
                  </Button>
                  <Button onClick={handleshowEditModal} type="primary" ghost>
                     Cập nhật
                  </Button>
               </div>
            }
         >
            <Form
               form={form}
               color="red"
               requiredMark={false}
               layout="vertical"
               name="Mở thông tin"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  validateStatus={valueInfoEmail !== null ? "success" : "error"}
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
                     {
                        type: "email",
                        message: "Email không hợp lệ",
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
                  validateStatus={valueInfoName !== null ? "success" : "error"}
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
                  validateStatus={valueInfoPhone !== null ? "success" : "error"}
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
            open={isShowLogout}
            onCancel={handleCloseModalLogout}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModalLogout}>Hủy</Button>
                  <Button onClick={handleLogout} type="primary" danger>
                     Đăng xuất
                  </Button>
               </div>
            }
            title="Xác nhận"
         >
            <p>Bạn có chắc chắn muốn đăng xuất không?</p>
         </Modal>

         {/* Giao diện header */}
         <div className="flex items-center justify-between p-5 ">
            <a href="#">
               <img
                  src="./src/assets/img/logo.png"
                  alt="Logo"
                  className="logo"
               />
            </a>
            <nav className="nav flex items-center justify-between gap-60">
               {/* Lọc theo sản phẩm */}
               <div className="flex items-center gap-3">
                  <p>Lọc sản phẩm</p>
                  <Select
                     defaultValue="all"
                     onChange={(value) => setSelectedCategoryUser(value)}
                     style={{ width: 120 }}
                     options={[
                        {
                           value: "all",
                           label: "Tất cả",
                        },
                        ...categories
                           ?.filter((cat) => cat.status === true)
                           .map((cat) => ({
                              value: cat.id,
                              label: cat.name,
                           })),
                     ]}
                  />
                  {/* About */}
                  <div>
                     <p onClick={handleShowAbout} className="cursor-pointer">
                        About
                     </p>
                  </div>
                  {/* Contact us */}
                  <div>
                     <p className="cursor-pointer">
                        <a href="#footer">Contact us</a>
                     </p>
                  </div>
                  {/* Tìm kiếm */}
                  <div>
                     <Input.Search
                        value={searchValueProduct}
                        onChange={(e) => setSearchValueProduct(e.target.value)}
                        placeholder="Tìm kiếm tài khoản"
                        className="w-[350px]"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {checkRoleAdmin ? (
                     <Button
                        onClick={() => navigate("/admin")}
                        type="primary"
                        danger
                        ghost
                     >
                        Qua trang ADMIN
                     </Button>
                  ) : (
                     ""
                  )}
                  <Dropdown
                     className="cursor-pointer"
                     placement="bottom"
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
            </nav>
         </div>
      </>
   );
}
