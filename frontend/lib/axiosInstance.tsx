import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("axios Error");
    console.log(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
