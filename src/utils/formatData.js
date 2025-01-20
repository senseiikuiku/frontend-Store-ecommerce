/**
 * Hàm format định dạng tiền tệ
 * @param {*} money chuổi tiền tệ cần format
 * @returns chuỗi tiền tệ đã được format theo dạng Việt Nam. VD: 100.00 VNĐ
 * Auth: DMD (13/1/2025)
 */

const formatMoney = (money) => {
   return money.toLocaleString("it-IT", { style: "currency", currency: "VND" });
};

export { formatMoney };
