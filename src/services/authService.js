import baseURL from "@/api/instance";

const login = async (formData) => {
   const response = await baseURL.post("auth/login", formData);
   return response.data;
};

const register = async (formData) => {
   const response = await baseURL.post("auth/register", formData);
   console.log("response: ",response);
   
   return response.data;
};

export { login, register };
