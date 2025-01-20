import React, { useEffect, useState } from "react";
import Header from "./header";
import Menu from "./menu";
import { Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./adminLayout.css";
export default function AdminLayout() {
    const navigate = useNavigate();
    const [checkRoleAdmin, setCheckRoleAdmin] = useState(false);

    useEffect(() => {
       // kiểm tra token từ cookie
       const accessToken = Cookies.get("accessToken");

       if (!accessToken) {
          navigate("/login");
          return;
       }

       const accountLogined =
          JSON.parse(localStorage.getItem("accountLogined")) || {};

       const checkIsAdmin = accountLogined?.roles?.some(
          (role) => role === "ROLE_ADMIN"
       );

       if (checkIsAdmin) {
          setCheckRoleAdmin(true);
       } else {
          navigate("/user");
       }
    }, [navigate]);

    if (!checkRoleAdmin) {
       return null; // Hoặc bạn có thể hiển thị một spinner hoặc thông báo chờ
    }

   return (
      <>
         <Header />
         <div className="flex h-full transition-all">
            <Menu />
            <div className="bg-green-100 flex-1 p-2 pb ">
               <Outlet className="transiton_OutLet" />
            </div>
         </div>
      </>
   );
}
