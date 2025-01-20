// Hàm kiểm tra định dạng của Tên
const validateName = (value) => {
   const regex =
      /^[a-zA-ZÀÁẠÃẢẶẴẲẮẰÁĂÂẤẪẨẬẦÃÈẼẺẸÉÊẾỀỄỆỂÌÍỈỊIỢỠỚỜỞÕỌỎÒÓỔỖỐỒỘÔÕƯỨỪỰỮỬỤŨỦÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÊƠàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũơớờợởỡăắằặẳẵâấầậẩẫêếềệểễđĩọỏốồộổỗồờớợởẽẹẻếìíùúụũưữựửữữýỳỵỷỹ ]+$/;
   return regex.test(value);
};

// Hàm xử lý Tên
const handleNameChange = (e, setNameStatus) => {
   const name = e.target.value;

   // Cập nhật trạng thái validate
   if (!name) {
      setNameStatus("");
   } else if (validateName(name)) {
      setNameStatus("success");
   } else {
      setNameStatus("error");
   }
};

// Hàm kiểm tra định dạng email
const validateEmail = (email) => {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra email
   return emailRegex.test(email);
};

// Hàm xử lý email
const handleEmailChange = (e, setEmailStatus) => {
   const email = e.target.value;
   // Cập nhật trạng thái validate
   if (!email) {
      setEmailStatus(""); // Reset trạng thái nếu input rỗng
   } else if (validateEmail(email)) {
      setEmailStatus("success"); // Email hợp lệ
   } else {
      setEmailStatus("error"); // Email không hợp lệ
   }
};

// Hàm kiểm tra định dạng của password
const validatePassword = (password) => {
   const regex = /^[A-Za-z0-9]{5,}$/;
   return regex.test(password);
};

// Hàm xử lý password
const handlePasswordChange = (e, setPassStatus) => {
   const password = e.target.value;
   if (!password) {
      setPassStatus("");
   } else if (validatePassword(password)) {
      setPassStatus("success");
   } else {
      setPassStatus("error");
   }
};

// Hàm xử lý onChangeNewPassword
const handleNewPasswordChange = (value, setNewPasswordStatus) => {
   if (!value) {
      setNewPasswordStatus("error");
   } else if (value.length >= 5) {
      setNewPasswordStatus("success");
   } else {
      setNewPasswordStatus("error");
   }
};

export {
   handleNameChange,
   handleEmailChange,
   handlePasswordChange,
   handleNewPasswordChange,
   validateEmail,
   validateName,
   validatePassword,
};
