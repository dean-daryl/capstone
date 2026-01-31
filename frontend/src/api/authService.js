import apiClient from "./apiClient.js";


export const login = async (credentials)=> {
  try {
    const response = await apiClient.post("auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (credentials) => {
    try {
      const response = await apiClient.post('auth/signup', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  };