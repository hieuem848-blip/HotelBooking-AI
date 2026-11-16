import api from "./apiClient";

export const getNotifications = async () => (await api.get("/profile/notifications")).data;
