import {
   Button,
   Form,
   Input,
   message,
   Modal,
   Pagination,
   Select,
   Table,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./categoryManager.css";
import {
   createCategory,
   getAllCategories,
   getCategoriesWithProducts,
   removeCategory,
   updateCategory,
} from "@/services/categoryService";
import { CloseOutlined } from "@ant-design/icons";
import { useDebounce } from "@/hooks/userDebounce";
import { HttpStatusCode } from "axios";

export default function CategoryManager() {
   const [form] = Form.useForm();
   const nameRef = useRef();
   const [isShowModal, setIsShowModal] = useState(false);
   const [categories, setCategories] = useState([]);
   const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isAddLoading, setIsAddloading] = useState(false);
   const [isShowModalDelete, setIsShowModalDelete] = useState(false);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
   const [baseId, setBaseId] = useState(null);
   const [totalElements, setTotalElements] = useState(0);
   const [searchValue, setSearchValue] = useState("");
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(8);
   const [selectedStatusCategory, setSelectedStatusCategory] = useState("all");
   const [selectedCategoryHasProduct, setSelectedCategoryHasProduct] =
      useState("all");

   // Các cột của bảng
   const columns = [
      {
         title: "Tên danh mục",
         dataIndex: "categoryName",
         key: "categoryName",
         render: (_, cat) => (
            <p title={cat.categoryName} className="format">
               {cat.categoryName}
            </p>
         ),
      },
      {
         title: "Trạng thái",
         dataIndex: "status",
         key: "status",
         render: (_, cat) => (
            <p
               className={
                  cat.status
                     ? "font-semibold text-green-400"
                     : "font-semibold text-red-400"
               }
            >
               {cat.status ? "Đang hoạt động" : "Không hoạt động"}
            </p>
         ),
      },
      {
         title: "Tình trạng",
         dataIndex: "hasProduct",
         key: "hasProducts",
         render: (_, cat) => {
            const hasProducts = categoriesWithProducts.some(
               (category) => category.id === cat.id
            );
            return (
               <p
                  className={
                     hasProducts
                        ? "font-semibold text-blue-500"
                        : "font-semibold text-red-500"
                  }
               >
                  {hasProducts ? "Có sản phẩm" : "Không có sản phẩm"}
               </p>
            );
         },
      },
      {
         title: "Hành động",
         key: "action",
         with: 150,
         render: (_, cat) => {
            const hasProduct = categoriesWithProducts.some(
               (category) => category.id === cat.id
            );
            const canDelete = !(hasProduct && cat.status === false);
            return (
               <div className=" flex gap-2">
                  {canDelete && (
                     <Button
                        onClick={() => {
                           handleShowModalDelete(cat.id);
                        }}
                        danger
                        type="primary"
                        size="middle"
                        ghost
                        style={{
                           color: hasProduct ? "#efb748" : "", // Màu chữ cho nút "Khóa"
                           borderColor: hasProduct ? "#efb748" : "", // Màu viền cho nút "Khóa"
                        }}
                     >
                        {hasProduct ? "Khóa" : "Xóa"}
                     </Button>
                  )}
                  <Button
                     type="primary"
                     ghost
                     size="middle"
                     onClick={() => handleEdit(cat)}
                  >
                     Sửa
                  </Button>
               </div>
            );
         },
      },
   ];

   // Dữ liệu truyền xuống bảng
   const data = categories?.map((cat) => {
      return {
         id: cat.id,
         key: cat.id,
         categoryName: cat.name,
         status: cat.status,
         statusId: cat.id,
      };
   });

   // Hàm mở modal thêm danh mục
   const handleShowModal = () => {
      setIsShowModal(true);
      // Reset form
      form.resetFields();

      setTimeout(() => {
         if (nameRef.current) {
            nameRef.current.focus();
         }
      }, 100);
   };

   // Tự động focus vào input name
   useEffect(() => {
      if (nameRef.current) {
         nameRef.current.focus();
      }
   }, [isShowModal]);

   // Hàm đóng modal thêm sản phẩm
   const handleCloseModal = () => {
      setIsShowModal(false);
      // Reset form
      form.resetFields();

      // Reset baseId
      setBaseId(null);
   };

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   // Lấy dữ liệu từ danh mục
   const fetchCategories = async () => {
      setIsLoading(true);
      const response = await getAllCategories(
         debounceSearch,
         currentPage,
         pageSize,
         selectedStatusCategory === "all" ? null : selectedStatusCategory,
         selectedCategoryHasProduct === "all"
            ? null
            : selectedCategoryHasProduct
      );
      setCategories(response.content);
      // Lấy ra tổng số bảng ghi
      setTotalElements(response.totalElements);
      setIsLoading(false);
   };

   // Lấy dữ liệu từ danh mục có sản phẩm
   const fetchCategoriesWithProducts = async () => {
      const response = await getCategoriesWithProducts();

      setCategoriesWithProducts(response.data);
   };

   // Sẽ lấy dữ liêu từ danh mục khi search
   useEffect(() => {
      fetchCategories();
   }, [
      debounceSearch,
      currentPage,
      pageSize,
      selectedStatusCategory,
      selectedCategoryHasProduct,
   ]);

   // sẽ chạy khi truy cập qua trang quản lý danh mục
   useEffect(() => {
      fetchCategories();
      fetchCategoriesWithProducts();
   }, []);

   // Hàm xử lý thêm danh mục hoặc sửa danh mục
   const onFinish = async (values) => {
      try {
         setIsAddloading(true);
         if (baseId) {
            const responseUpdate = await updateCategory(baseId, values);
            console.log(responseUpdate);

            if (responseUpdate.status === 200) {
               message.success("Cập nhật danh mục thành công!");
            } else {
               message.error("Cập nhật danh mục thất bại, vui lòng thử lại!");
               return;
            }
         } else {
            const responseCreate = await createCategory(values);

            if (responseCreate.status === 201) {
               message.success("Thêm danh mục thành công");
            } else {
               message.error("Thêm danh mục thất bại, vui lòng thử lại!");
               return;
            }
         }
         fetchCategories();
         handleCloseModal();
         form.resetFields();
         // reset baseId
         setBaseId(null);
      } catch (error) {
         console.log(error);
         if (error.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data);
         } else {
            message.error(error?.response?.data?.categoryName);
         }
      } finally {
         setIsAddloading(false);
      }
   };

   // Hàm mở modal delete
   const handleShowModalDelete = (id) => {
      setIsShowModalDelete(true);

      // Lấy baseId
      setBaseId(id);
   };

   // Hàm đóng modal delete
   const handleCloseModalDelete = () => {
      setIsShowModalDelete(false);
      // Reset lại baseId
      setBaseId(null);
   };

   // Hàm xác nhận xóa
   const handleConfirmDelete = async () => {
      // Gọi API xóa dữ liệu
      try {
         setIsDeleteLoading(true);
         const response = await removeCategory(baseId);
         if (response.status === 200) {
            message.success("Xóa danh mục thành công");
         } else {
            message.error("Xóa thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         message.error(error?.response?.data);
      } finally {
         handleCloseModalDelete();
         fetchCategories();
         // Reset lại baseId
         setBaseId(null);
         setIsDeleteLoading(false);
      }
   };

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage - 1);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   // Hàm mở modal cập nhật
   const handleEdit = (cat) => {
      setIsShowModal(true);

      // Lấy id
      setBaseId(cat.id);

      // Tìm kiếm và fill giá trị product vào trong input form
      form.setFieldsValue({
         ...cat,
         status: cat.status,
      });
   };
   return (
      <>
         {/* Giao diện form thêm danh mục / cập nhật danh mục */}
         <Modal
            title={`${baseId ? "Sửa" : "Thêm"} danh mục`}
            onCancel={handleCloseModal}
            footer={false}
            open={isShowModal}
         >
            <Form
               form={form}
               layout="vertical"
               name="basic"
               onFinish={onFinish}
               autoComplete="off"
            >
               <Form.Item
                  label="Tên danh mục"
                  name="categoryName"
                  rules={[
                     {
                        required: true,
                        message: "Tên danh mục không bỏ trống",
                     },
                  ]}
               >
                  <Input ref={nameRef} />
               </Form.Item>

               {baseId ? (
                  <Form.Item
                     label="Trạng thái"
                     name="status"
                     rules={[
                        {
                           required: true,
                           message: "Trạng thái không bỏ trống",
                        },
                     ]}
                  >
                     <Select
                        placeholder="Chọn trạng thái"
                        options={[
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
                  </Form.Item>
               ) : (
                  ""
               )}

               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCloseModal}
                        type="primary"
                        danger
                        ghost
                        htmlType="buttons"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isAddLoading}
                        type="primary"
                        htmlType="submit"
                     >
                        {baseId ? "Lưu" : "Thêm"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện xóa danh mục */}
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
                  <h3 className="text-[20px]">Xác nhận xóa danh mục</h3>
                  <CloseOutlined
                     onClick={handleCloseModalDelete}
                     className="cursor-pointer"
                  />
               </div>
            }
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắn chắn muốn xóa danh mục</p>
               <p className="text-red-400 format">
                  {categories.map((cat) => {
                     if (cat.id === baseId) {
                        return cat.name;
                     }
                  })}
               </p>
               <p>này không?</p>
            </div>
         </Modal>
         {/* Giao diện Header */}
         <div className="relative">
            {/* Giao diện Logo, Tìm kiém, Thêm danh mục */}
            <div className="flex justify-between mb-3">
               <h3 className="text-[24px] font-semibold">Danh mục</h3>
               <div className="flex gap-2 items-center">
                  <p>Trạng thái</p>
                  <Select
                     defaultValue="all"
                     onChange={(value) => setSelectedStatusCategory(value)} // Cập nhật thể loại
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
                  <p>Tình trạng</p>
                  <Select
                     defaultValue="all"
                     onChange={(value) => setSelectedCategoryHasProduct(value)} // Cập nhật thể loại
                     style={{ width: 160 }}
                     options={[
                        {
                           value: "all",
                           label: "Tất cả",
                        },
                        {
                           value: true,
                           label: "Có sản phẩm",
                        },
                        {
                           value: false,
                           label: "Không có sản phẩm",
                        },
                     ]}
                  />
               </div>
               <div>
                  <Input.Search
                     placeholder="Tìm kiếm danh mục"
                     value={searchValue}
                     onChange={(e) => setSearchValue(e.target.value)}
                     className="w-[350px]"
                  />
               </div>
               <Button onClick={handleShowModal} type="primary">
                  Thêm danh mục
               </Button>
            </div>
            {/* Giao diện bảng danh mục */}
            <div className="mb-2">
               <Table
                  loading={isLoading}
                  pagination={false}
                  columns={columns}
                  dataSource={data}
               />
            </div>
            {/* Giao diện phân trang */}
            {totalElements <= 8 ? (
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
                     pageSizeOptions={[8, 20, 50, 80, 100]}
                  />
               </div>
            )}
         </div>
      </>
   );
}
