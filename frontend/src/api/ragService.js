import apiClient from "./apiClient";

export const queryDocuments = async (question) => {
  const response = await apiClient.post("/rag/query", { question });
  return response.data;
};

export const uploadDocument = async (file, courseId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (courseId) {
    formData.append("courseId", courseId);
  }
  const response = await apiClient.post("/rag/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await apiClient.get("/rag/documents");
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await apiClient.get(`/rag/documents/${id}`);
  return response.data;
};

export const getDocumentViewUrl = async (id) => {
  const response = await apiClient.get(`/rag/documents/${id}/view`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await apiClient.delete(`/rag/documents/${id}`);
  return response.data;
};

export const reprocessDocument = async (id) => {
  const response = await apiClient.post(`/rag/documents/${id}/reprocess`);
  return response.data;
};

export const translateText = async (text) => {
  const response = await apiClient.post("/translate", {
    text,
    srcLang: "eng_Latn",
    tgtLang: "kin_Latn",
  });
  return response.data;
};

export const simplifyText = async (text) => {
  const response = await apiClient.post("/simplify", { text });
  return response.data;
};

export const submitSatisfaction = async (queryId, satisfaction) => {
  const response = await apiClient.post(`/rag/queries/${queryId}/satisfaction`, { satisfaction });
  return response.data;
};
