import api from "./apiClient";

// Công khai (khách vãng lai dùng được)
export const getBookingQuote = async (params) => (await api.get("/bookings/quote", { params })).data;

export const lookupBooking = async (params) => (await api.get("/bookings/lookup", { params })).data;

export const createBooking = async (data) => (await api.post("/bookings", data)).data;

// Cần đăng nhập
export const getMyBookings = async () => (await api.get("/bookings/my")).data;

export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;

export const payBooking = async (id) => (await api.post(`/bookings/${id}/pay`)).data;

export const cancelBooking = async (id) => (await api.post(`/bookings/${id}/cancel`)).data;

export const getAllBookings = async () => (await api.get("/bookings/admin/all")).data;
