import apiClient from "./apiClient";

export const getCourses = async () => {
  const response = await apiClient.get("/courses");
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await apiClient.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async ({ name, code, cohort }) => {
  const response = await apiClient.post("/courses", { name, code, cohort });
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await apiClient.delete(`/courses/${id}`);
  return response.data;
};

export const getCourseDocuments = async (courseId) => {
  const response = await apiClient.get(`/rag/documents/course/${courseId}`);
  return response.data;
};
