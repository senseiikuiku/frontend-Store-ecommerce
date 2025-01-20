import React, { useEffect, useRef, useState } from "react";
import "./accountManager.css";
import {
   Button,
   Checkbox,
   Form,
   Input,
   message,
   Modal,
   Pagination,
   Radio,
   Select,
   Table,
} from "antd";
import {
   getAllRoleName,
   getAllUsers,
   removeUser,
   updateUser,
} from "@/services/userService";
import { useDebounce } from "@/hooks/userDebounce";
import { CloseOutlined } from "@ant-design/icons";
import { HttpStatusCode } from "axios";

export default function AccountManager() {
   const [users, setUsers] = useState([]);
   const [roleNames, setRoleNames] = useState([]);
   const [form] = Form.useForm();
   const nameRef = useRef();
   const [isLoading, setIsLoading] = useState(false);
   const [isShowModal, setIsShowModal] = useState(false);
   const [isShowModalDelete, setIsShowModalDelete] = useState(false);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
   const [isEditLoading, setIsEditloading] = useState(false);

   const [baseId, setBaseId] = useState(null);
   const [totalElements, setTotalElements] = useState(0);
   const [searchValue, setSearchValue] = useState("");
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(5);
   const [isCurrentUser, setIsCurrentUser] = useState(false);
   const [checkStatusUser, setCheckStatusUser] = useState("all");
   const [checkGenderUser, setCheckGenderUser] = useState("all");

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogined =
      JSON.parse(localStorage.getItem("accountLogined")) || {};

   // Các cột của bảng
   const columns = [
      {
         title: "Tên tài khoản",
         dataIndex: "fullName",
         key: "fullName",
         render: (_, user) => (
            <p title={user.fullName} className="format">
               {user.fullName}
            </p>
         ),
      },
      {
         title: "Email",
         dataIndex: "email",
         key: "email",
         render: (_, user) => (
            <p title={user.email} className="format">
               {user.email}
            </p>
         ),
      },
      {
         title: "Số điện thoại",
         dataIndex: "phone",
         key: "phone",
         render: (_, user) => (
            <p
               title={user.phone === null ? "Chưa có" : user.phone}
               className={
                  user.phone === null
                     ? "format font-semibold text-red-500"
                     : "format"
               }
            >
               {user.phone === null ? "Chưa có" : user.phone}
            </p>
         ),
      },
      {
         title: "Giới tính",
         dataIndex: "gender",
         key: "gender",
         render: (_, user) => {
            const genderText =
               user.gender === "MALE"
                  ? "Nam"
                  : user.gender === "FEMALE"
                  ? "Nữ"
                  : user.gender === "OTHER"
                  ? "Khác"
                  : "Chưa có";
            const genderClass =
               user.gender === "MALE"
                  ? "text-blue-500"
                  : user.gender === "FEMALE"
                  ? "text-pink-500"
                  : user.gender === "OTHER"
                  ? "text-yellow-500"
                  : "text-red-500";
            return (
               <p
                  title={genderText}
                  className={`format font-semibold ${genderClass}`}
               >
                  {genderText}
               </p>
            );
         },
      },
      {
         title: "Trạng thái",
         dataIndex: "status",
         key: "status",
         render: (_, user) => (
            <p
               className={
                  user.status
                     ? "font-semibold text-green-400"
                     : "font-semibold text-red-400"
               }
            >
               {user.status ? "Hoạt động" : "Không hoạt động"}
            </p>
         ),
      },
      {
         title: "vai trò",
         dataIndex: "roles",
         key: "roles",
         render: (_, user) => (
            <p title={user.roles} className="format">
               {user.roles}
            </p>
         ),
      },
      {
         title: "Hành động",
         dataIndex: "action",
         key: "action",
         render: (_, user) => (
            <div className="flex gap-2 items-center">
               {user.email === accountLogined.email ? (
                  <button className="admin">Quản trị viên</button>
               ) : (
                  <Button
                     onClick={() => handleShowModalDelete(user.id)}
                     type="primary"
                     danger
                     ghost
                     style={{
                        color: user.status ? "#efb748" : "", // Màu chữ cho nút "Khóa"
                        borderColor: user.status ? "#efb748" : "", // Màu viền cho nút "Khóa"
                     }}
                  >
                     {user.status ? "Khóa" : "Xóa"}
                  </Button>
               )}
               <Button onClick={() => handleEdit(user)} type="primary" ghost>
                  Sửa
               </Button>
            </div>
         ),
      },
   ];

   // Dữ liệu để truyền xuống bảng
   const data = users?.map((user) => {
      return {
         id: user.id,
         key: user.id,
         fullName: user.fullName,
         email: user.email,
         gender: user.gender,
         phone: user.phone,
         address: user.address,
         status: user.status,
         roles: user.roles.map((role) => role.roleName).join(", "), // Chuyển đổi mảng roles thành chuỗi
         arrRoles: user.roles,
      };
   });

   // Tự động focus vào trường name
   useEffect(() => {
      if (nameRef.current) {
         nameRef.current.focus();
      }
   }, [isShowModal]);

   // Hàm đóng modal cập nhật tài khoản
   const handleCloseModal = () => {
      setIsShowModal(false);

      // reset baseId
      setBaseId(null);
      form.resetFields();
   };

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   // Lấy dữ liệu từ người dùng
   const fetchUsers = async () => {
      // Trước khi gọi API hiển thị loading
      setIsLoading(true);
      const response = await getAllUsers(
         debounceSearch,
         currentPage,
         pageSize,
         checkStatusUser === "all" ? null : checkStatusUser,
         checkGenderUser === "all" ? null : checkGenderUser
      );

      setUsers(response.content);

      // Lấy ra tổng số bảng ghi
      setTotalElements(response.totalElements);

      // Sau khi đã có dữ liệu tắt loading
      setIsLoading(false);
   };

   // Lấy dữ liệu tất cả roleName
   const fetchRoleName = async () => {
      const response = await getAllRoleName();

      setRoleNames(response);
   };

   // Sẽ lấy dữ liêu từ sản phẩm khi search
   useEffect(() => {
      fetchUsers();
   }, [
      debounceSearch,
      currentPage,
      pageSize,
      checkStatusUser,
      checkGenderUser,
   ]);

   // sẽ chạy khi truy cập qua trang quản lý tài khoản
   useEffect(() => {
      fetchUsers();
      fetchRoleName();
   }, []);

   // Hàm xác nhận cập nhật tài khoản
   const onFinish = async (values) => {
      try {
         console.log("value ", values);

         setIsEditloading(true);
         if (baseId) {
            const response = await updateUser(baseId, values);
            console.log(response);

            if (response.status === 200) {
               message.success("Cập nhật tài khoản thành công");

               // Kiểm tra xem user đang được cập nhật có phải là user đang đăng nhập không
               const isCurrentUser = accountLogined.email === values.email;
               if (isCurrentUser) {
                  // Cập nhật các trường có sẵn
                  const updatedAccount = {
                     ...accountLogined,
                     fullName: values.fullName || accountLogined.fullName,
                     email: values.email || accountLogined.email,
                     phone: values.phone || accountLogined.phone,
                     address: values.address || accountLogined.address,
                     status: values.status || accountLogined.status,
                     roles: values.roles || accountLogined.roles, // Cập nhật roles
                  };

                  // Lưu lại dữ liệu đã cập nhật vào Local Storage
                  localStorage.setItem(
                     "accountLogined",
                     JSON.stringify(updatedAccount)
                  );
                  message.success("Lưu trên hệ thống thành công");
               }
            } else {
               message.error("Cập nhật tài khoản thất bại, vui lòng thử lại!");
            }
         }
         // Load lại dữ liệu
         fetchUsers();

         // Tắt modal
         handleCloseModal();

         // Reset form
         form.resetFields();

         // reset baseId
         setBaseId(null);
      } catch (error) {
         if (error?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data);
         } else {
            message.error(error?.response?.data);
         }
      } finally {
         setIsEditloading(false);
      }
   };

   // Hàm mở modal cập nhật
   const handleEdit = (user) => {
      setIsShowModal(true);

      // Lấy id
      setBaseId(user.id);

      // Kiểm tra và xử lý giá trị roles
      const roles = Array.isArray(user.arrRoles)
         ? user.arrRoles.map((role) => role.roleName)
         : [];

      // Kiểm tra xem user đang cập nhật có phải là user đang đăng nhập không
      const isCurrentUser = accountLogined.email === user.email;
      setIsCurrentUser(isCurrentUser);

      // Tìm kiếm và fill giá trị user vào trong input form
      form.setFieldsValue({
         ...user,
         gender: user.gender,
         status: isCurrentUser ? true : user.status,
         roles: roles,
      });
   };

   // Hàm mở modal xóa
   const handleShowModalDelete = (id) => {
      setIsShowModalDelete(true);

      // Lấy id
      setBaseId(id);
   };

   // Hàm đóng modal xóa
   const handleCloseModalDelete = () => {
      setIsShowModalDelete(false);

      // Reset lại baseId
      setBaseId(null);
   };

   // Hàm xác nhận xóa
   const handleConfirmDelete = async () => {
      try {
         setIsDeleteLoading(true);
         const response = await removeUser(baseId);

         if (response.status === 200) {
            // Hiện thông báo
            message.success("Xóa tài khoản thành công");
         } else {
            message.error("Xóa thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         message.error(error?.response?.data);
      } finally {
         setIsDeleteLoading(false);
         // Đóng modal delete
         handleCloseModalDelete();
         // Render lại danh sách tài khoản
         fetchUsers();
         // Reset lại baseId
         setBaseId(null);
      }
   };

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage - 1);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };
   return (
      <>
         {/* Giao diện form cập nhật tài khoản */}
         <Modal
            footer={false}
            title="Cập nhật tài khoản"
            open={isShowModal}
            onCancel={handleCloseModal}
         >
            <Form
               form={form}
               name="basic"
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

               <div className="flex justify-between">
                  <Form.Item
                     label="Trạng thái"
                     name="status"
                     rules={[
                        {
                           required: true,
                           message: "Trạng thái bỏ trống",
                        },
                     ]}
                  >
                     <Select
                        placeholder="Chọn trạng thái"
                        style={{ width: 170 }}
                        options={
                           isCurrentUser
                              ? [{ value: true, label: "Hoạt động" }]
                              : [
                                   { value: true, label: "Hoạt động" },
                                   { value: false, label: "Không hoạt động" },
                                ]
                        }
                     />
                  </Form.Item>

                  <Form.Item
                     label="Vai trò"
                     name="roles"
                     rules={[
                        {
                           required: true,
                           message: "Vai trò không bỏ trống",
                        },
                     ]}
                  >
                     <Checkbox.Group>
                        {roleNames.map((role, index) => (
                           <Checkbox
                              key={index}
                              value={role}
                              disabled={isCurrentUser && role === "ROLE_ADMIN"}
                           >
                              {role}
                           </Checkbox>
                        ))}
                     </Checkbox.Group>
                  </Form.Item>
               </div>

               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCloseModal}
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

         {/* Giao diện xóa tài khoản */}
         <Modal
            closeIcon={false} // Tắt đi dấu x của modal
            open={isShowModalDelete}
            onCancel={handleCloseModalDelete}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModalDelete} type="primary" ghost>
                     Hủy
                  </Button>
                  <Button
                     loading={isDeleteLoading}
                     onClick={handleConfirmDelete}
                     type="primary"
                     danger
                  >
                     Xóa
                  </Button>
               </div>
            }
            title={
               <div className="flex items-center justify-between">
                  <h3 className="text-[20px]">Xác nhận xóa tài khoản</h3>
                  <CloseOutlined
                     onClick={handleCloseModalDelete}
                     className="cursor-pointer"
                  />
               </div>
            }
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắn chắn muốn xóa sản phẩm</p>
               <p className="text-red-400 format">
                  {users.map((user) => {
                     if (user.id === baseId) {
                        return user.name;
                     }
                  })}
               </p>
               <p>này không?</p>
            </div>
         </Modal>

         {/*Giao diện Header */}
         <div className="relative">
            {/* Giao diện Logo, Tìm kiém, Thêm sản phẩm */}
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-[24px] font-semibold">Tài khoản</h3>
               {/* Giao diện Logo, Tìm kiém, Thêm danh mục */}
               <div className="flex gap-2 items-center">
                  <p>Trạng thái</p>
                  <Select
                     defaultValue="all"
                     onChange={(value) => setCheckStatusUser(value)} // Cập nhật thể loại
                     style={{ width: 160 }}
                     options={[
                        {
                           value: "all",
                           label: "Tất cả",
                        },
                        {
                           value: true,
                           label: "Hoạt động",
                        },
                        {
                           value: false,
                           label: "Không hoạt động",
                        },
                     ]}
                  />
               </div>
               <div className="flex gap-2 items-center">
                  <p>Giới tính</p>
                  <Select
                     defaultValue="all"
                     onChange={(value) => setCheckGenderUser(value)} // Cập nhật thể loại
                     style={{ width: 100 }}
                     options={[
                        {
                           value: "all",
                           label: "Tất cả",
                        },
                        {
                           value: "MALE",
                           label: "Nam",
                        },
                        {
                           value: "FEMALE",
                           label: "Nữ",
                        },
                        {
                           value: "OTHER",
                           label: "Khác",
                        },
                     ]}
                  />
               </div>
               <div>
                  <Input.Search
                     placeholder="Tìm kiếm tài khoản"
                     className="w-[350px]"
                     value={searchValue}
                     onChange={(e) => setSearchValue(e.target.value)}
                  />
               </div>
            </div>
            {/* Giao diện bảng sản phẩm */}
            <div className="mb-2">
               <Table
                  loading={isLoading}
                  pagination={false}
                  columns={columns}
                  dataSource={data}
               />
            </div>

            {/* Giao diện phân trang */}
            {totalElements <= 5 ? (
               ""
            ) : (
               <div className="page">
                  <Pagination
                     showSizeChanger
                     total={totalElements}
                     showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`
                     }
                     onChange={handleChangePage}
                     defaultPageSize={pageSize}
                     defaultCurrent={currentPage}
                     pageSizeOptions={[5, 10, 20, 50, 100]}
                  />
               </div>
            )}
         </div>
      </>
   );
}
