import React, { useState, createContext } from "react";

// Tạo context cho Header
const HeaderContext = createContext();

function UserHeaderProvider({ children }) {
   const [searchValue, setSearchValue] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("all");

   // Nhật ký để kiểm tra giá trị của searchValue và selectedCategory
   console.log("UserHeaderProvider - searchValue: ", searchValue);
   console.log("UserHeaderProvider - selectedCategory: ", selectedCategory);

   return (
      <HeaderContext.Provider
         value={{
            searchValue,
            setSearchValue,
            selectedCategory,
            setSelectedCategory,
         }}
      >
         {children}
      </HeaderContext.Provider>
   );
}

export { HeaderContext, UserHeaderProvider };
