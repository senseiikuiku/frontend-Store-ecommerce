import axios from "axios";
import Cookies from "js-cookie";

const token = Cookies.get("accessToken");

const baseURL = axios.create({
   baseURL: "http://localhost:8080/api/v1/",
   headers: { "Content-Type": "application/json" },
});

baseURL.interceptors.request.use(
   (config) => {
      const accessToken = `Bearer ${token}`;
      config.headers.Authorization = accessToken;
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);


export default baseURL;
