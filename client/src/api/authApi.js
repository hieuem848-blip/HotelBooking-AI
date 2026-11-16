import api from "./apiClient";

export const requestOtp = async (email) => (await api.post("/auth/otp/request", { email })).data;
export const verifyOtp = async (payload) => (await api.post("/auth/otp/verify", payload)).data;
export const staffLogin = async (payload) => (await api.post("/auth/staff/login", payload)).data;
export const loginWithGoogle = async (credential) => (await api.post("/auth/google", { credential })).data;
export const loginWithFacebook = async (accessToken) =>
  (await api.post("/auth/facebook", { accessToken })).data;
export const getMe = async () => (await api.get("/auth/me")).data;
