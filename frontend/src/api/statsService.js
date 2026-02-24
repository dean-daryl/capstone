import apiClient from "./apiClient";

export const fetchOverviewStats = async () => {
  const response = await apiClient.get("/stats/overview");
  return response.data;
};
