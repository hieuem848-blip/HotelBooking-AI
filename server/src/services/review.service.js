import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Review from "../models/Review.js";
import { httpError } from "../utils/httpError.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MY_REVIEWS_LIMIT = 100;

const toPositiveInt = (value, fallback) => {
  const number = Number.parseInt(value, 10);

  return Number.isNaN(number) || number < 1 ? fallback : number;
};

/** Điểm trung bình, tổng số và số đánh giá theo từng mức sao (chỉ tính đánh giá đang công khai). */
export const getRatingSummary = async (hotelId) => {
  const rows = await Review.aggregate([
    { $match: { hotelId: new mongoose.Types.ObjectId(String(hotelId)), status: "PUBLISHED" } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;

  for (const row of rows) {
    distribution[row._id] = row.count;
    count += row.count;
    sum += row._id * row.count;
  }

  return { average: count ? Math.round((sum / count) * 10) / 10 : 0, count, distribution };
};

/** Tính lại điểm và số đánh giá của khách sạn từ các đánh giá thật. */
export const refreshHotelStats = async (hotelId) => {
  const { average, count } = await getRatingSummary(hotelId);

  await Hotel.updateOne({ _id: hotelId }, { averageRating: average, reviewCount: count });
};

/** Đánh giá công khai của một khách sạn, có phân trang và thống kê theo sao. */
export const listHotelReviews = async (hotelId, query = {}) => {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);

  const [items, summary] = await Promise.all([
    Review.find({ hotelId, status: "PUBLISHED" })
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("rating title comment images hotelResponse createdAt userId")
      .populate({ path: "userId", select: "fullName avatar" })
      .lean(),
    getRatingSummary(hotelId),
  ]);

  return {
    items,
    summary,
    pagination: { page, limit, total: summary.count, hasMore: page * limit < summary.count },
  };
};

/** Đánh giá của chính người dùng (kèm khách sạn và đơn đặt phòng) để hiện ở "Đánh giá của tôi". */
export const listMyReviews = (userId) =>
  Review.find({ userId })
    .sort({ createdAt: -1 })
    .limit(MY_REVIEWS_LIMIT)
    .populate({ path: "hotelId", select: "name slug images address.city" })
    .populate({ path: "bookingId", select: "bookingCode checkIn checkOut" })
    .lean();

/**
 * Tạo đánh giá cho một đơn đặt phòng. Điều kiện: đơn của chính người dùng, đã COMPLETED, chưa đánh giá.
 * hotelId lấy từ đơn đặt phòng, không nhận từ client.
 */
export const createReview = async (userId, { bookingId, rating, title, comment, images }) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) throw httpError(404, "Không tìm thấy đơn đặt phòng.");

  if (booking.status !== "COMPLETED") {
    throw httpError(400, "Bạn chỉ có thể đánh giá sau khi đã hoàn thành kỳ nghỉ.");
  }

  let review;

  try {
    review = await Review.create({
      userId,
      bookingId: booking._id,
      hotelId: booking.hotelId,
      rating,
      title,
      comment,
      images,
    });
  } catch (error) {
    if (error.code === 11000) throw httpError(409, "Bạn đã đánh giá đơn đặt phòng này rồi.");
    throw error;
  }

  await refreshHotelStats(booking.hotelId);

  return review;
};

/** Sửa đánh giá của chính mình. Sửa nội dung thì kết quả AI cũ không còn đúng nên bị xoá để phân tích lại. */
export const updateReview = async (userId, reviewId, changes) => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    { $set: changes, $unset: { aiAnalysis: "" } },
    { returnDocument: "after", runValidators: true },
  );
  if (!review) throw httpError(404, "Không tìm thấy đánh giá.");

  await refreshHotelStats(review.hotelId);

  return review;
};

/** Xoá đánh giá của chính mình. */
export const deleteReview = async (userId, reviewId) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) throw httpError(404, "Không tìm thấy đánh giá.");

  await refreshHotelStats(review.hotelId);
};
