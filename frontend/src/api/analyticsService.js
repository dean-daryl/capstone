import apiClient from "./apiClient";

export const fetchAnalyticsData = async (
  startDate,
  endDate
) => {
  try {
    const response = await apiClient.get(
      "stats/detailed",
      {
        params: {},
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    
    // Transform the response to match the expected format
    // The new API returns: { topTopics: [{topicName, count}, ...] }
    const data = response.data?.data || response.data;
    const topTopics = data.topTopics || [];
    
    // Convert to the format expected by the chart: { topicName: count, ... }
    const transformedData = topTopics.reduce((acc, topic) => {
      acc[topic.topicName] = topic.count;
      return acc;
    }, {});
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw new Error("Failed to fetch analytics data. Please try again later.");
  }
};

export const fetchDetailedStats = async (customerId = null) => {
  try {
    const url = customerId 
      ? `stats/detailed?customerId=${customerId}`
      : "stats/detailed";
      
    const response = await apiClient.get(
      url,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching detailed stats:", error);
    throw new Error("Failed to fetch detailed stats. Please try again later.");
  }
};
