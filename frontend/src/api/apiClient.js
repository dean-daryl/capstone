import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://extension-backend-g4iv.onrender.com",
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
