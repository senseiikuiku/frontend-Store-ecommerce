import React, { useEffect, useState } from "react";
import Header from "./header";
import RenderProduct from "./renderProduct";
import Footer from "./footer";
import "./userLayout.css";
import { UserHeaderProvider } from "@/providers/userHeaderProvider";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function UserLayout() {
    const navigate = useNavigate();
    const [checkRoleUser, setCheckRoleUser] = useState(false);

    useEffect(() => {
       // kiểm tra token từ cookie
       const accessToken = Cookies.get("accessToken");

       if (!accessToken) {
          navigate("/login");
          return;
       }

       const accountLogined =
          JSON.parse(localStorage.getItem("accountLogined")) || {};

       const checkIsUser = accountLogined?.roles?.some(
          (role) => role === "ROLE_USER"
       );

       if (checkIsUser) {
          setCheckRoleUser(true);
       } else {
          navigate("/admin");
       }
    }, [navigate]);

    if (!checkRoleUser) {
       return null; // Hoặc bạn có thể hiển thị một spinner hoặc thông báo chờ
    }
   return (
      <UserHeaderProvider>
         <header className="header mb-3">
            <div className="container">
               <Header />
            </div>
         </header>
         <div>
            <div className="container">
               <RenderProduct />
            </div>
         </div>
         <footer>
            <div className="container">
               <Footer />
            </div>
         </footer>
      </UserHeaderProvider>
   );
}
