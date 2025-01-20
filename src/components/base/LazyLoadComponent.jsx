import { Spin } from "antd";
import React, { Suspense } from "react";

export default function LazyLoadComponent({ children }) {
   const contentStyle = {
      padding: 50,
      background: "rgba(0, 0, 0, 0.05)",
      borderRadius: 4,
   };
   const content = <div style={contentStyle} />;
   return (
      <Suspense
         fallback={
            <div className="fixed inset-0 flex justify-center items-center">
               <Spin tip="Đang tải ...  " size="large">
                  {content}
               </Spin>
            </div>
         }
      >
         {children}
      </Suspense>
   );
}
