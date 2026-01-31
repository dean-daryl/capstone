import apiClient from "./apiClient";



export const fetchAnalyticsData = async (
  startDate,
  endDate
) => {
  try {
    const response = await apiClient.get(
      "technology/stats/by-date-range",
      {
        params: {
          startDate,
          endDate,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw new Error("Failed to fetch analytics data. Please try again later.");
  }
};
