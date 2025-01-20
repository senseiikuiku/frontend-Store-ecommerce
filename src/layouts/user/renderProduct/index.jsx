import React, { useContext, useEffect, useState } from "react";
import "./renderProduct.css";
import { getAllUserProduct } from "@/services/productService";
import { Pagination } from "antd";
import { useDebounce } from "@/hooks/userDebounce";
import { HeaderContext } from "@/providers/userHeaderProvider";

export default function RenderProduct() {
   const {
      searchValue,
      setSearchValue,
      selectedCategory,
      setSelectedCategory,
   } = useContext(HeaderContext);

   console.log("searchValue, ", searchValue);

   // Kiểm tra nếu context không trả về giá trị đúng
   if (
      searchValue === undefined ||
      setSearchValue === undefined ||
      selectedCategory === undefined ||
      setSelectedCategory === undefined
   ) {
      console.error("Context values are missing!");
   }

   const [products, setProducts] = useState([]);
   const [totalElements, setTotalElements] = useState(0);
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(8);
   const [isLoading, setIsLoading] = useState(false);

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   // Lấy tất cả sẽ phẩm
   const fetchProducts = async () => {
      setIsLoading(true);
      const response = await getAllUserProduct(
         debounceSearch,
         currentPage,
         pageSize,
         selectedCategory === "all" ? null : selectedCategory
      );

      // Render tất cả sản phẩm
      setProducts(response.content);

      // Lấy ra tổng số bảng ghi
      setTotalElements(response.totalElements);

      // Sau khi đã có dữ liệu tắt loading
      setIsLoading(false);
   };

   useEffect(() => {
      fetchProducts();
   }, [debounceSearch, currentPage, pageSize, selectedCategory]);

   // Sẽ chạy mỗi khi vào trang user
   useEffect(() => {
      fetchProducts();
   }, []);

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage - 1);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   return (
      <>
         <div className="mb-3">
            {/* Render sản phẩm */}
            <div className="list_show_product">
               {products.map((pro) => (
                  <section key={pro.id} className="cart">
                     <div className="wrap-img-cart">
                        <img src={pro.image} alt="" className="img-cart" />
                     </div>
                     <h3 title={pro.name} className="title format">
                        {pro.name}
                     </h3>
                     <p className="brand">Thương hiệu: {pro.brand.name}</p>
                     <div className="row flex items-center gap-3 justify-between">
                        <p className="price">
                           <span className="text-slate-400 mr-1 font-light">
                              Giá:
                           </span>
                           {pro.price} VNĐ
                        </p>
                        <div className="row-price-star flex items-center">
                           <img
                              src="./src/assets/img/main-star.svg"
                              alt=""
                              className="star"
                           />
                           <p className="star-num">4.3</p>
                        </div>
                        <button className="add-to-cart-button mb-3">
                           Add to Cart
                        </button>
                     </div>
                  </section>
               ))}
            </div>
            {/* Giao diện thanh phân */}
            {totalElements <= 8 ? (
               ""
            ) : (
               <div className="flex justify-center items-center mt-5">
                  <div className="w-fit px-3 py-3 border-pagination">
                     <Pagination
                        showSizeChanger
                        total={totalElements}
                        showTotal={(total, range) =>
                           `${range[0]}-${range[1]} of ${total} items`
                        }
                        onChange={handleChangePage}
                        defaultPageSize={pageSize}
                        defaultCurrent={currentPage}
                        pageSizeOptions={[8, 16, 32, 64, 100]}
                     />
                  </div>
               </div>
            )}
         </div>
      </>
   );
}
