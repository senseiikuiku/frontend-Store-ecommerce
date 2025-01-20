import { useDebounce } from "@/hooks/userDebounce";
import {
   getAllCategory,
   getCategoriesWithProducts,
} from "@/services/categoryService";
import {
   addColorToProduct,
   addImageToProduct,
   createProduct,
   getAllProduct,
   removeColorFromProduct,
   removeImageFromProduct,
   removeProduct,
   updateColorToProduct,
   updateImageToProduct,
   updateProduct,
} from "@/services/productService";
import { formatMoney } from "@/utils/formatData";
import { CloseOutlined } from "@ant-design/icons";
import {
   Button,
   Input,
   Modal,
   Pagination,
   Table,
   Form,
   InputNumber,
   Select,
   message,
   Image,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./productManager.css";
import { HttpStatusCode } from "axios";
import { getAllBrand, getBrandsWithProducts } from "@/services/brandService";

export default function ProductManager() {
   const [isShowModal, setIsShowModal] = useState(false);
   const [categories, setCategories] = useState([]);
   const [brands, setBrands] = useState([]);
   const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
   const [BrandsWithProducts, setBrandsWithProducts] = useState([]);
   const [form] = Form.useForm();
   const [products, setProducts] = useState([]);
   const nameRef = useRef();
   const [isAddLoading, setIsAddloading] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isShowModalDelete, setIsShowModalDelete] = useState(false);
   const [baseId, setBaseId] = useState(null);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
   const [searchValue, setSearchValue] = useState("");
   const [totalElements, setTotalElements] = useState(0);
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(4);
   const [selectedCategory, setSelectedCategory] = useState("all");
   const [selectedBrand, setSelectedBrand] = useState("all");
   const [isShowModalColor, setIsShowModalColor] = useState(false);
   const [isEditColor, setIsEditColor] = useState(false);
   const [valueEditColor, setValueEditColor] = useState("");
   const [isColorLoading, setIsColorLoading] = useState(false);
   const [formColor] = Form.useForm();
   const nameColorRef = useRef();
   const [isShowModalColorDelete, setIsShowModalColorDelete] = useState(false);
   const [formColorDelete] = Form.useForm();
   const [isDeleteColorLoading, setIsDeleteColorLoading] = useState(false);
   const [valueDeleteColor, setValueDeleteColor] = useState("");
   const [isShowModalImage, setIsShowModalImage] = useState(false);
   const nameImageRef = useRef();
   const [formImage] = Form.useForm();
   const [isImageLoading, setIsImageLoading] = useState(false);
   const [isShowModalImageDelete, setIsShowModalImageDelete] = useState(false);
   const [isEditImage, setIsEditImage] = useState(false);
   const [valueEditImage, setValueEditImage] = useState("");
   const [formImageDelete] = Form.useForm();
   const [isDeleteImageLoading, setIsDeleteImageLoading] = useState(false);
   const [valueDeleteImage, setValueDeleteImage] = useState("");

   // Các cột của bảng
   const columns = [
      {
         title: "Tên danh mục",
         dataIndex: "name",
         key: "name",
         render: (_, pro) => (
            <p title={pro.name} className="format">
               {pro.name}
            </p>
         ),
      },
      {
         title: "Hình ảnh đại diện",
         dataIndex: "image",
         key: "image",
         render: (_, pro) => (
            <Image
               width={80}
               height={80}
               src={pro.image}
               alt={`Hình của sản phẩm ${pro.name}`} // lấy name trong data
            />
         ),
      },
      {
         title: "Giá",
         dataIndex: "price",
         key: "price",
         render: (_, pro) => (
            <p className="text-green-500">{formatMoney(pro.price)}</p>
         ),
      },
      {
         title: "Số lượng",
         key: "quantity",
         dataIndex: "quantity",
         render: (_, pro) => <p className="text-red-400">{pro.quantity}</p>,
      },
      {
         title: "Thể loại",
         key: "category",
         dataIndex: "category",
         render: (_, pro) => (
            <p className="text-purple-500">{pro.categoryName}</p>
         ), // lấy categoryName trong data
      },
      {
         title: "Thương hiệu",
         key: "brand",
         dataIndex: "brand",
         render: (_, pro) => <p className="text-yellow-500">{pro.brandName}</p>,
      },
      {
         title: "Hành động",
         key: "action",
         with: 150,
         render: (_, pro) => (
            <div className=" flex gap-2">
               <Button
                  onClick={() => handleShowModalDelete(pro.id)}
                  danger
                  type="primary"
                  ghost
                  size="middle"
               >
                  Xóa
               </Button>
               <Button
                  onClick={() => handleEdit(pro)}
                  type="primary"
                  ghost
                  size="middle"
               >
                  Sửa
               </Button>
            </div>
         ),
      },
      {
         title: "Màu sắc",
         key: "colors",
         dataIndex: "colors",
         render: (_, pro) => (
            <div className="flex items-center justify-between">
               <p
                  title={
                     pro.colors.length > 0
                        ? pro.colors.join(", ")
                        : "Chưa có màu sắc"
                  }
                  className={
                     pro.colors.length > 0
                        ? "format font-semibold text-blue-500"
                        : "format font-semibold text-red-500"
                  }
               >
                  {pro.colors.length > 0
                     ? pro.colors.join(", ")
                     : "Chưa có màu sắc"}
               </p>
               <div className="flex gap-2 flex-col">
                  <Button
                     onClick={() => handleShowModalColor(pro)}
                     ghost
                     type="primary"
                     className="w-16"
                  >
                     Thêm
                  </Button>
                  <Button
                     onClick={() => handleShowModalColorDelete(pro)}
                     danger
                     ghost
                     type="primary"
                     className="w-16 "
                  >
                     Xóa
                  </Button>
                  <Button
                     onClick={() => handleShowModalColorEdit(pro)}
                     style={{ color: "green", borderColor: "green" }}
                     className="w-16 "
                  >
                     Sửa
                  </Button>
               </div>
            </div>
         ),
      },
      {
         title: "Tất cả hình ảnh",
         key: "images",
         dataIndex: "images",
         render: (_, pro) => (
            <div className="flex items-center gap-2">
               <div
                  title={
                     pro.images.length > 0
                        ? `${pro.images.length} hình ảnh`
                        : "Chưa có hình ảnh"
                  }
                  className={
                     pro.images.length > 0
                        ? "format font-semibold text-blue-500"
                        : "format font-semibold text-red-500"
                  }
               >
                  {pro.images.length > 0 ? (
                     <Image.PreviewGroup
                        items={pro.images.map((image, index) => ({
                           src: image,
                           alt: `Hình ảnh số ${index + 1}`,
                        }))}
                     >
                        <Image
                           width={101}
                           height={101}
                           src={pro.images[0]}
                           alt="Hình ảnh đầu tiên"
                        />
                     </Image.PreviewGroup>
                  ) : (
                     "Chưa có hình ảnh"
                  )}
               </div>
               <div className="flex gap-2 flex-col">
                  <Button
                     onClick={() => handleShowModalImage(pro)}
                     ghost
                     type="primary"
                     className="w-16"
                  >
                     Thêm
                  </Button>
                  <Button
                     ghost
                     danger
                     type="primary"
                     className="w-16"
                     onClick={() => handleShowModalImageDelete(pro)}
                  >
                     Xóa
                  </Button>
                  <Button
                     onClick={() => handleShowModalImageEdit(pro)}
                     style={{ color: "green", borderColor: "green" }}
                     className="w-16 "
                  >
                     Sửa
                  </Button>
               </div>
            </div>
         ),
      },
   ];

   // Dữ liệu để truyền xuống bảng
   const data = products?.map((pro) => {
      return {
         id: pro.id,
         key: pro.id,
         name: pro.name,
         image: pro.image,
         price: pro.price,
         images: pro.images,
         colors: pro.colors,
         quantity: pro.quantity,
         categoryId: pro.category?.id,
         categoryName: pro.category?.name,
         brandName: pro.brand?.name,
         brandId: pro.brand?.id,
         description: pro.description,
      };
   });

   // Hàm mở modal thêm sản phẩm
   const handleShowModal = () => {
      setIsShowModal(true);
      setTimeout(() => {
         if (nameRef.current) {
            nameRef.current.focus();
         }
      }, 100);
   };

   // Tự động focus vào trường name
   useEffect(() => {
      if (nameRef.current) {
         nameRef.current.focus();
      }
   }, [isShowModal]);

   // Hàm đóng modal thêm sản phẩm
   const handleCloseModal = () => {
      setIsShowModal(false);

      // reset baseId
      setBaseId(null);
      form.resetFields();
   };

   // Lấy dữ liệu từ danh mục
   const fetchCategories = async () => {
      const response = await getAllCategory();

      setCategories(response);
   };

   // Lấy dữ liệu từ thương hiệu
   const fetchBrands = async () => {
      const response = await getAllBrand();

      setBrands(response);
   };

   // Lấy dữ liệu từ danh mục có sản phẩm
   const fetchCategoriesWithProducts = async () => {
      const response = await getCategoriesWithProducts();

      setCategoriesWithProducts(response.data);
   };

   // Lấy dữ liệu từ thương hiệu có sản phẩm
   const fetchBrandsWithProducts = async () => {
      const response = await getBrandsWithProducts();

      setBrandsWithProducts(response.data);
   };

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   // Lấy dữ liệu từ sản phẩm
   const fetchProducts = async () => {
      // Trước khi gọi API hiển thị loading
      setIsLoading(true);

      const response = await getAllProduct(
         debounceSearch,
         currentPage,
         pageSize,
         selectedCategory === "all" ? null : selectedCategory,
         selectedBrand === "all" ? null : selectedBrand
      );

      // Render tất cả sản phẩm
      setProducts(response.content);
      // Lấy ra tổng số bảng ghi
      setTotalElements(response.totalElements);

      // Sau khi đã có dữ liệu tắt loading
      setIsLoading(false);
   };

   // Sẽ lấy dữ liêu từ sản phẩm khi search
   useEffect(() => {
      fetchProducts();
   }, [debounceSearch, currentPage, pageSize, selectedCategory, selectedBrand]);

   // sẽ chạy khi truy cập qua trang quản lý sản phẩm
   useEffect(() => {
      fetchCategories();
      fetchBrands();
      fetchProducts();
      fetchCategoriesWithProducts();
      fetchBrandsWithProducts();
   }, []);

   // Hàm xử lý thêm sản phẩm hoặc sửa sản phẩm
   const onFinish = async (values) => {
      try {
         console.log("values: ", values);

         setIsAddloading(true);
         if (baseId) {
            // Cập nhật thông tin sản phẩm
            const responseUpdate = await updateProduct(baseId, values);
            if (responseUpdate.status === 200) {
               // Hiển thị thông báo thêm mới thành công
               message.success("Cập nhật sản phẩm thành công!");
            } else {
               message.error("Cập nhật sản phẩm thất bại, vui lòng thử lại!");
               return;
            }
         } else {
            // Thêm mới sản phẩm
            const responseCreate = await createProduct(values);

            // Hiển thị thông báo thành công
            if (responseCreate.status === 201) {
               // Hiển thị thông báo thêm mới thành công
               message.success("Sản phẩm đã được tạo thành công!");
            } else {
               message.error("Thêm sản phẩm thất bại, vui lòng thử lai!");
               return;
            }
         }
         // Load lại dữ liệu
         await fetchProducts();

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
            message.error("Đã xảy ra lỗi, vui lòng thử lại!");
         }
      } finally {
         setIsAddloading(false);
      }
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
      // Gọi API xóa dữ liệu
      try {
         setIsDeleteLoading(true);
         const response = await removeProduct(baseId);
         if (response.status === 200) {
            // Đóng modal delete
            handleCloseModalDelete();
            // Hiện thông báo
            message.success("Xóa sản phẩm thành công");
            // Render lại danh sách sản phẩm
            fetchProducts();
            // Reset lại baseId
            setBaseId(null);
            // Cập nhật lại trang hiện tại nếu cần thiết
            if (currentPage > 0 && products.length === 1) {
               setCurrentPage(currentPage - 1);
               await fetchProducts(); // Load lại dữ liệu sau khi cập nhật trang
            }
         } else {
            message.error("Xóa thất bại, vui lòng thử lại!");
            return;
         }
      } catch (error) {
         message.error("Đã xảy ra lỗi, vui lòng thử lại!");
      } finally {
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
   const handleEdit = (pro) => {
      setIsShowModal(true);

      // Lấy id
      setBaseId(pro.id);

      // Tìm kiếm và fill giá trị product vào trong input form
      form.setFieldsValue({
         ...pro,
         categoryId: pro.categoryId,
         brandId: pro.brandId,
      });
   };

   // Hàm mở modal thêm màu
   const handleShowModalColor = (pro) => {
      setIsShowModalColor(true);

      setIsEditColor(false);

      setBaseId(pro.id);

      setTimeout(() => {
         if (nameColorRef.current) {
            nameColorRef.current.focus();
         }
      }, 100);
   };

   useEffect(() => {
      if (nameColorRef.current) {
         nameColorRef.current.focus();
      }
   }, [isShowModalColor]);

   // Hàm đóng modal thêm màu
   const handleCloseModalColor = () => {
      setIsShowModalColor(false);
      setIsEditColor(false);
      // Reset baseId
      setBaseId(null);

      formColor.resetFields();
   };

   // Hàm mở modal sửa màu
   const handleShowModalColorEdit = (pro) => {
      setIsShowModalColor(true);

      setBaseId(pro.id);
      setIsEditColor(true);
   };

   // Hàm xử lý thêm màu
   const onFinishColor = async (values) => {
      console.log("values: ", values);

      try {
         setIsColorLoading(true);
         if (isEditColor) {
            // Goi API sửa màu
            const response = await updateColorToProduct(
               baseId,
               valueEditColor,
               values.color
            );
            if (response.status === 200) {
               // Hiển thị thông báo sửa màu thành công
               message.success("Sửa màu sắc thành công!");
            } else {
               message.error("Sửa màu sắc thất bại, vui lòng thử lại!");
               return;
            }
         } else {
            // Gọi API thêm màu
            const response = await addColorToProduct(baseId, values);
            if (response.status === 200) {
               // Hiển thị thông báo thêm mới thành công
               message.success("Thêm màu sắc thành công!");
            } else {
               message.error("Thêm màu sắc thất bại, vui lòng thử lại!");
               return;
            }
         }
         // Load lại dữ liệu
         fetchProducts();
         formColor.resetFields();
         setIsEditColor(false);
         setBaseId(null);
         setIsEditColor(false);
         handleCloseModalColor();
      } catch (error) {
         if (error?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data);
         } else {
            message.error("Đã xảy ra lỗi, vui lòng thử lại!");
         }
      } finally {
         setIsColorLoading(false);
      }
   };

   // Hàm mở modal xóa màu
   const handleShowModalColorDelete = (pro) => {
      setIsShowModalColorDelete(true);

      setBaseId(pro.id);
   };

   // Hàm đóng modal xóa màu
   const handleCloseModalColorDelete = () => {
      setIsShowModalColorDelete(false);
      formColorDelete.resetFields();
      setBaseId(null);
      setValueDeleteColor("");
   };

   // Hàm xử lý xóa màu
   const onFinishColorDelete = async (values) => {
      try {
         setIsDeleteColorLoading(true);
         // Gọi API xóa màu
         const response = await removeColorFromProduct(
            baseId,
            valueDeleteColor
         );
         if (response.status === 200) {
            // Hiển thị thông báo xóa thành công
            message.success("Xóa màu sắc thành công!");
         } else {
            message.error("Xóa màu sắc thất bại, vui lòng thử lại!");
            return;
         }
         // Load lại dữ liệu
         fetchProducts();
         formColorDelete.resetFields();
         setBaseId(null);
         setValueDeleteColor("");
         handleCloseModalColorDelete();
      } catch (error) {
         console.log(error);
         if (error.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Xóa màu sắc thất bại, vui lòng thử lại!");
         }
      } finally {
         setIsDeleteColorLoading(false);
      }
   };

   // Hàm mở modal thêm hình ảnh
   const handleShowModalImage = (pro) => {
      setIsShowModalImage(true);

      setBaseId(pro.id);
      setTimeout(() => {
         if (nameImageRef.current) {
            nameImageRef.current.focus();
         }
      }, 100);
   };

   useEffect(() => {
      if (nameImageRef.current) {
         nameImageRef.current.focus();
      }
   }, [isShowModalImage]);

   // Hàm đóng modal thêm hình ảnh
   const handleCloseModalImage = () => {
      setIsShowModalImage(false);
      formImage.resetFields();
      setBaseId(null);
      setIsEditImage(false);
      setValueEditImage("");
   };

   // Hàm mở modal sửa hình ảnh
   const handleShowModalImageEdit = (pro) => {
      setIsShowModalImage(true);

      setBaseId(pro.id);
      setIsEditImage(true);

      setTimeout(() => {
         if (nameImageRef.current) {
            nameImageRef.current.focus();
         }
      }, 100);
   };

   // Hàm xử lý thêm hình ảnh / sửa hình ảnh
   const onFinishImage = async (values) => {
      try {
         setIsImageLoading(true);

         if (isEditImage) {
            // Gọi API sửa hình ảnh
            const response = await updateImageToProduct(
               baseId,
               valueEditImage,
               values.image
            );
            if (response.status === 200) {
               message.success("Sửa hình ảnh thành công!");
            } else {
               message.error("Sửa hình ảnh thất bại, vui lòng thử lại!");
               return;
            }
         } else {
            // Gọi API thêm hình ảnh
            const response = await addImageToProduct(baseId, values);
            if (response.status === 200) {
               // Hiển thị thông báo thêm mới thành công
               message.success("Thêm hình ảnh thành công!");
            } else {
               message.error("Thêm hình ảnh thất bại, vui lòng thử lại!");
               return;
            }
         }

         // Load lại dữ liệu
         fetchProducts();
         setValueEditImage("");
         setBaseId(null);
         formImage.resetFields();
         setIsEditImage(false);
         handleCloseModalImage();
      } catch (error) {
         if (error.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi, vui lòng thử lại!");
         }
      } finally {
         setIsImageLoading(false);
      }
   };

   // Hàm mở modal xóa hình ảnh
   const handleShowModalImageDelete = (pro) => {
      setIsShowModalImageDelete(true);

      setBaseId(pro.id);
   };

   // Hàm đóng modal xóa hình ảnh
   const handleCloseModalImageDelete = () => {
      setIsShowModalImageDelete(false);
      formImageDelete.resetFields();
      setValueDeleteImage("");
      setBaseId(null);
   };

   // Hàm xử lý xóa hình ảnh
   const onFinishImageDelete = async (values) => {
      try {
         setIsDeleteImageLoading(true);
         // Gọi API xóa hình ảnh
         const response = await removeImageFromProduct(
            baseId,
            valueDeleteImage
         );
         if (response.status === 200) {
            // Hiển thị thông báo xóa thành công
            message.success("Xóa hình ảnh thành công!");
         } else {
            message.error("Xóa hình ảnh thất bại, vui lòng thử lại!");
            return;
         }
         // Load lại dữ liệu
         fetchProducts();
         formImageDelete.resetFields();
         setBaseId(null);
         setValueDeleteImage("");
         handleCloseModalImageDelete();
      } catch (error) {
         console.log(error);

         if (error.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Xóa hình ảnh thất bại, vui lòng thử lại!");
         }
      } finally {
         setIsDeleteImageLoading(false);
      }
   };

   return (
      <>
         {/* Giao diện form xóa hình ảnh */}
         <Modal
            open={isShowModalImageDelete}
            onCancel={handleCloseModalImageDelete}
            footer={false}
            title="Xóa hình ảnh"
         >
            <Form
               onFinish={onFinishImageDelete}
               name="deleteColor"
               layout="vertical"
               form={formImageDelete}
            >
               <Form.Item
                  label="Hình ảnh"
                  name="image"
                  rules={[
                     {
                        required: true,
                        message: "Vui lòng chọn hình ảnh",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn hình ảnh"
                     style={{
                        width: 140,
                     }}
                     onChange={(value) => setValueDeleteImage(value)}
                     options={products
                        .filter((pro) => pro.id === baseId)
                        .flatMap((pro) =>
                           pro.images.map((image, index) => ({
                              value: image,
                              label: (
                                 <Image
                                    key={`${image}-${index}`}
                                    width={50}
                                    height={50}
                                    src={image}
                                 />
                              ),
                           }))
                        )}
                  />
               </Form.Item>
               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCloseModalImageDelete}
                        type="primary"
                        ghost
                     >
                        Đóng
                     </Button>
                     <Button
                        loading={isDeleteImageLoading}
                        type="primary"
                        danger
                        ghost
                        onClick={onFinishImageDelete}
                     >
                        Xóa
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện form thêm hình ảnh / sửa hình ảnh */}
         <Modal
            onCancel={handleCloseModalImage}
            footer={false}
            title={isEditImage ? "Sửa hình ảnh" : "Thêm hình ảnh"}
            open={isShowModalImage}
         >
            <Form
               onFinish={onFinishImage}
               requiredMark={false}
               form={formImage}
               name="basic"
               layout="vertical"
               autoComplete="off"
            >
               {!isEditImage ? (
                  <Form.Item
                     label="Hình ảnh"
                     name="image"
                     rules={[
                        {
                           required: true,
                           message: "Hình ảnh không bỏ trống",
                        },
                     ]}
                  >
                     <Input ref={nameImageRef} placeholder="Nhập hình ảnh" />
                  </Form.Item>
               ) : (
                  <>
                     <Form.Item
                        label="Hình ảnh"
                        rules={[
                           {
                              required: true,
                              message: "Vui lòng chọn hình ảnh",
                           },
                        ]}
                     >
                        <Select
                           placeholder="Chọn hình ảnh"
                           style={{
                              width: 140,
                           }}
                           onChange={(value) => setValueEditImage(value)}
                           options={products
                              .filter((pro) => pro.id === baseId)
                              .flatMap((pro) =>
                                 pro.images.map((image) => ({
                                    value: image,
                                    label: (
                                       <Image
                                          width={50}
                                          height={50}
                                          src={image}
                                       />
                                    ),
                                 }))
                              )}
                        />
                     </Form.Item>

                     <Form.Item
                        label="Hình ảnh mới"
                        name="image"
                        rules={[
                           {
                              required: true,
                              message: "Hình ảnh không bỏ trống",
                           },
                        ]}
                     >
                        <Input
                           ref={nameImageRef}
                           placeholder="Nhập hình ảnh mới"
                        />
                     </Form.Item>
                  </>
               )}

               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCloseModalImage}
                        type="primary"
                        danger
                        ghost
                        htmlType="button"
                     >
                        Đóng
                     </Button>
                     <Button
                        loading={isImageLoading}
                        type="primary"
                        htmlType="submit"
                     >
                        {isEditImage ? "Lưu" : "Thêm"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện form xóa màu sắc */}
         <Modal
            onCancel={handleCloseModalColorDelete}
            open={isShowModalColorDelete}
            footer={false}
            title="Xóa màu sắc"
         >
            <Form
               name="deleteColor"
               onFinish={onFinishColorDelete}
               layout="vertical"
               form={formColorDelete}
            >
               <Form.Item
                  label="Màu sắc"
                  name="color"
                  rules={[
                     {
                        required: true,
                        message: "Vui lòng chọn màu sắc",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn màu sắc"
                     onChange={(value) => setValueDeleteColor(value)}
                     style={{
                        width: 140,
                     }}
                     options={products
                        .filter((pro) => pro.id === baseId)
                        .flatMap((pro) =>
                           pro.colors.map((color) => ({
                              value: color,
                              label: color,
                           }))
                        )}
                  />
               </Form.Item>
               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        type="primary"
                        ghost
                        onClick={handleCloseModalColorDelete}
                     >
                        Đóng
                     </Button>
                     <Button
                        loading={isDeleteColorLoading}
                        onClick={onFinishColorDelete}
                        type="primary"
                        danger
                        ghost
                     >
                        Xóa
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện form thêm màu sắc / sửa màu sắc */}
         <Modal
            footer={false}
            title={isEditColor ? "Sửa màu sắc" : "Thêm màu sắc"}
            open={isShowModalColor}
            onCancel={() => handleCloseModalColor(false)}
         >
            <Form
               requiredMark={false}
               form={formColor}
               name="basic"
               layout="vertical"
               autoComplete="off"
               onFinish={onFinishColor}
            >
               {!isEditColor ? (
                  <Form.Item
                     label="Màu sắc"
                     name="color"
                     rules={[
                        {
                           required: true,
                           message: "Tên màu không bỏ trống",
                        },
                        {
                           pattern: /^[a-zA-ZÀ-ỹ\s]+$/u,
                           message: "Tên màu chỉ được chứa chữ cái",
                        },
                     ]}
                  >
                     <Input ref={nameColorRef} placeholder="Nhập màu sắc" />
                  </Form.Item>
               ) : (
                  <>
                     <Form.Item
                        label="Màu sắc cần sửa"
                        rules={[
                           {
                              required: true,
                              message: "Tên màu không bỏ trống",
                           },
                        ]}
                     >
                        <Select
                           placeholder="Chọn màu sắc"
                           onChange={(value) => setValueEditColor(value)}
                           style={{
                              width: 140,
                           }}
                           options={products
                              .filter((pro) => pro.id === baseId)
                              .flatMap((pro) =>
                                 pro.colors.map((color) => ({
                                    value: color,
                                    label: color,
                                 }))
                              )}
                        />
                     </Form.Item>

                     <Form.Item
                        label="Màu sắc mới"
                        name="color"
                        rules={[
                           {
                              required: true,
                              message: "Tên màu không bỏ trống",
                           },
                           {
                              pattern: /^[a-zA-ZÀ-ỹ\s]+$/u,
                              message: "Tên màu chỉ được chứa chữ cái",
                           },
                        ]}
                     >
                        <Input ref={nameColorRef} placeholder="Nhập màu sắc" />
                     </Form.Item>
                  </>
               )}

               <Form.Item label={null}>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCloseModalColor}
                        type="primary"
                        danger
                        ghost
                        htmlType="button"
                     >
                        Đóng
                     </Button>
                     <Button
                        loading={isColorLoading}
                        type="primary"
                        htmlType="submit"
                     >
                        {isEditColor ? "Lưu" : "Thêm"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện form thêm sản phẩm / cập nhật sản phẩm */}
         <Modal
            footer={false}
            title={`${baseId ? "Sửa" : "Thêm"} sản phẩm`}
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
                  label="Tên sản phẩm"
                  name="name"
                  rules={[
                     {
                        required: true,
                        message: "Tên sản phẩm không bỏ trống",
                     },
                  ]}
               >
                  <Input ref={nameRef} />
               </Form.Item>

               <Form.Item
                  label="Damh mục"
                  name="categoryId"
                  rules={[
                     {
                        required: true,
                        message: "Danh mục không bỏ trống",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn danh mục"
                     options={categories
                        ?.filter((cat) => cat.status === true)
                        .map((cat) => ({ value: cat.id, label: cat.name }))}
                  />
               </Form.Item>

               <Form.Item
                  label="Thương hiệu"
                  name="brandId"
                  rules={[
                     {
                        required: true,
                        message: "Thương hiệu không bỏ trống",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn thương hiệu"
                     options={brands
                        ?.filter((brand) => brand.status === true)
                        ?.map((brand) => ({
                           value: brand.id,
                           label: brand.name,
                        }))}
                  />
               </Form.Item>

               <Form.Item
                  label="Hình ảnh"
                  name="image"
                  rules={[
                     {
                        required: true,
                        message: "Hình ảnh không để trống",
                     },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item
                  label="Giá"
                  name="price"
                  rules={[
                     {
                        required: true,
                        message: "Giá không bỏ trống, chỉ nhập số",
                     },
                     {
                        type: "number",
                        message: "Vui lòng nhập một số hợp lệ",
                     },
                  ]}
               >
                  <InputNumber className="w-full" />
               </Form.Item>

               <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                     {
                        required: true,
                        message: "Số lượng không bỏ trống",
                     },
                  ]}
               >
                  <InputNumber className="w-full" />
               </Form.Item>

               <Form.Item
                  label="Mô tả"
                  name="description"
                  rules={[
                     {
                        required: true,
                        message: "Mô tả không bỏ trống",
                     },
                  ]}
               >
                  <Input className="w-full" />
               </Form.Item>

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

         {/* Giao diện xóa sản phẩm */}
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
                  <h3 className="text-[20px]">Xác nhận xóa sản phẩm</h3>
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
                  {products.map((pro) => {
                     if (pro.id === baseId) {
                        return pro.name;
                     }
                  })}
               </p>
               <p>này không?</p>
            </div>
         </Modal>

         {/*Giao diện Header */}
         <div className="relative">
            {/* Giao diện Logo, Tìm kiém, Thêm sản phẩm */}
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-[24px] font-semibold">Sản phẩm</h3>
               <div className="flex gap-4 items-center">
                  <div className="flex gap-2 items-center">
                     <p>Danh mục</p>
                     <Select
                        defaultValue="all"
                        onChange={(value) => setSelectedCategory(value)} // Cập nhật thể loại
                        style={{ width: 120 }}
                        options={[
                           {
                              value: "all",
                              label: "Tất cả",
                           },

                           ...categoriesWithProducts
                              ?.filter((cat) => cat.status === true) // Lọc các category có status = true
                              .map((cat) => ({
                                 value: cat.id,
                                 label: cat.name,
                              })),
                        ]}
                     />
                  </div>
                  <div className="flex gap-2 items-center">
                     <p>Thương hiệu</p>
                     <Select
                        defaultValue="all"
                        onChange={(value) => setSelectedBrand(value)} // Cập nhật thể loại
                        style={{ width: 120 }}
                        options={[
                           {
                              value: "all",
                              label: "Tất cả",
                           },

                           ...BrandsWithProducts?.filter(
                              (brand) => brand.status === true
                           ).map((brand) => ({
                              value: brand.id,
                              label: brand.name,
                           })),
                        ]}
                     />
                  </div>
               </div>
               <div>
                  <Input.Search
                     placeholder="Tìm kiếm sản phẩm"
                     value={searchValue}
                     onChange={(e) => setSearchValue(e.target.value)}
                     className="w-[350px]"
                  />
               </div>
               <Button type="primary" onClick={handleShowModal}>
                  Thêm sản phẩm
               </Button>
            </div>
            {/* Giao diện bảng sản phẩm */}
            <div className="mb-2 text-center">
               <Table
                  loading={isLoading}
                  pagination={false}
                  columns={columns}
                  dataSource={data}
               />
            </div>
            {/* Giao diện phân trang */}
            {totalElements <= 4 ? (
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
                     pageSizeOptions={[4, 8, 16, 32, 100]}
                  />
               </div>
            )}
         </div>
      </>
   );
}
