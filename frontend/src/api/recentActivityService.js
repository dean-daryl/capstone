import apiClient from "./apiClient";

export const getRecentActivity = async (userId, startDate, endDate, pageNumber, pageSize)  => {
    try {
        const response = await apiClient.get("recent-activity/user/date-range", {
            params: {
                userId,
                startDate,
                endDate,
                pageNumber,
                pageSize
            },
            headers: {
                Accept: "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        throw new Error("Failed to fetch recent activity. Please try again later.");
    }
};

export const getRecentActivityById = async (id)=> {
    try {
        const response = await apiClient.get(`recent-activity/user/id`, {
            params: {
               recentActivityId: id
            },
            headers: {
                Accept: "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recent activity by id:", error);
        throw new Error("Failed to fetch recent activity by id. Please try again later.");
    }
};