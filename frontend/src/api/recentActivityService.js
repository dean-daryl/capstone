import apiClient from "./apiClient";

export const getRecentActivity = async (userId, startDate, endDate, pageNumber, pageSize) => {
    try {
        const response = await apiClient.get("/recent-activity/user/date-range", {
            params: { userId, startDate, endDate, pageNumber, pageSize },
            headers: { Accept: "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return { content: [] };
    }
};

export const getRecentActivityById = async (id) => {
    try {
        const response = await apiClient.get("/recent-activity/user/id", {
            params: { recentActivityId: id },
            headers: { Accept: "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching recent activity by id:", error);
        throw new Error("Failed to fetch recent activity by id.");
    }
};

export const createRecentActivity = async (userId, question, answer) => {
    try {
        await apiClient.post("/recent-activity/", {
            userId,
            conversationType: "TEXT",
            conversation: { question, answer },
        }, {
            headers: { title: question.slice(0, 100) },
        });
    } catch (error) {
        console.error("Error saving recent activity:", error);
    }
};
