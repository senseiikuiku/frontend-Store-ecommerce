import {
   ChartColumnStacked,
   Gauge,
   ShoppingBasket,
   UsersRound,
} from "lucide-react";
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./menu.css";
import {
   AccountBookOutlined,
   ControlOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   PieChartOutlined,
   ProductOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
export default function MenuAdmin() {
   const [collapsed, setCollapsed] = useState(false);
   const location = useLocation();
   const items = [
      {
         key: "1",
         icon: <ControlOutlined />,
         label: (
            <NavLink
               end
               to="/admin"
               className="flex items-center gap-2  px-3 py-2 rounded-md translate-all"
            >
               <span>Thống kê</span>
            </NavLink>
         ),
      },
      {
         key: "2",
         icon: <PieChartOutlined />,
         label: (
            <NavLink
               to="/admin/category-manager"
               className="flex items-center gap-2  px-3 py-2 rounded-md translate-all"
            >
               <span> Quản lý danh mục</span>
            </NavLink>
         ),
      },
      {
         key: "3",
         icon: <ProductOutlined />,

         label: (
            <NavLink
               to="/admin/product-manager"
               className="flex items-center gap-2  px-3 py-2 rounded-md translate-all"
            >
               <span> Quản lý sản phẩm</span>
            </NavLink>
         ),
      },
      {
         key: "4",
         icon: <AccountBookOutlined />,
         label: (
            <NavLink
               to="/admin/account-manager"
               className="flex items-center gap-2  px-3 py-2 rounded-md translate-all"
            >
               <span> Quản lý tài khoản</span>
            </NavLink>
         ),
      },
   ];

   const toggleCollapsed = () => {
      setCollapsed(!collapsed);
   };

   // Xác định khóa được chọn mặc định dựa trên đường dẫn hiện tại
   const getDefaultKey = () => {
      const routeToKeyMap = {
         "/admin": "1",
         "/admin/category-manager": "2",
         "/admin/product-manager": "3",
         "/admin/account-manager": "4",
      };
      return routeToKeyMap[location.pathname] || "1"; // Default to "1" if no match
   };
   return (
      <>
         <menu className="w-fit bg-[#274040] h-[calc(100vh-64px)] text-white flex flex-col items-start">
            <div className="mb-3">
               <Menu
                  defaultSelectedKeys={[getDefaultKey()]}
                  mode="inline"
                  theme="dark"
                  inlineCollapsed={collapsed}
                  items={items}
               />
            </div>
            <Button
               type="primary"
               onClick={toggleCollapsed}
               style={{
                  marginBottom: 16,
               }}
            >
               {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
         </menu>

         {/*  */}
      </>
   );
}
