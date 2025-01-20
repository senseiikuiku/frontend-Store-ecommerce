import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LazyLoadComponent from "../components/base/LazyLoadComponent";
// Cách import thông thường => làm giảm hiệu năng ứng dụng
// import AdminLayout from "../layouts/admin/AdminLayout";
// import AccountManager from "../pages/admin/accountManager";
// import DashboardAdmin from "../pages/admin/dashboard";
// import CategoryManager from "../pages/admin/categoryManager";
// import ProductManager from "../pages/admin/productManager";

// Tải bằng lazy load
const AdminLayout = React.lazy(() => import("@/layouts/admin/AdminLayout"));
const UserLayout = React.lazy(() => import("@/layouts/user/UserLayout"));
const AccountManager = React.lazy(() => import("@/pages/admin/accountManager"));
const DashboardAdmin = React.lazy(() => import("@/pages/admin/dashboard"));
const CategoryManager = React.lazy(() =>
   import("@/pages/admin/categoryManager")
);
const ProductManager = React.lazy(() => import("@/pages/admin/productManager"));

// Các route liên quan đến đăng nhập và phân quyền
const Login = React.lazy(() => import("@/pages/auth/login"));
const Register = React.lazy(() => import("@/pages/auth/register"));

const routers = createBrowserRouter([
   {
      path: "/",
      element: <Navigate to="/login" />, // Khi truy cập vào URL gốc, chuyển hướng đến trang login
   },
   {
      path: "/login",
      element: (
         <LazyLoadComponent>
            <Login />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/register",
      element: (
         <LazyLoadComponent>
            <Register />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/user",
      element: (
         <LazyLoadComponent>
               <UserLayout />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/admin",
      element: (
         <LazyLoadComponent>
            <AdminLayout />
         </LazyLoadComponent>
      ),
      children: [
         {
            index: true,
            element: (
               <LazyLoadComponent>
                  <DashboardAdmin />
               </LazyLoadComponent>
            ),
         },
         {
            path: "account-manager",
            element: (
               <LazyLoadComponent>
                  <AccountManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "category-manager",
            element: (
               <LazyLoadComponent>
                  <CategoryManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "product-manager",
            element: (
               <LazyLoadComponent>
                  <ProductManager />
               </LazyLoadComponent>
            ),
         },
      ],
   },
]);

export default routers;
