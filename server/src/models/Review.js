import mongoose from "mongoose";

const MAX_IMAGES = 5;

const reviewSchema = new mongoose.Schema(
  {
    // Chỉ tạo được khi booking đã COMPLETED (kiểm tra trong services/review.service.js)
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: "Số sao phải là số nguyên." },
    },

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    images: {
      type: [String],
      default: [],
      validate: { validator: (value) => value.length <= MAX_IMAGES, message: `Tối đa ${MAX_IMAGES} ảnh.` },
    },

    status: {
      type: String,
      enum: ["PUBLISHED", "HIDDEN", "PENDING"],
      default: "PUBLISHED",
    },

    // Chủ khách sạn phản hồi (ghi từ phía dashboard chủ khách sạn)
    hotelResponse: {
      content: { type: String, trim: true, maxlength: 2000 },
      respondedAt: { type: Date },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // Kết quả AI Review Intelligence do phần AI ghi vào:
    // { sentiment, aspects: { cleanliness, location, service, room, price, food } }
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  },
);

// Mỗi booking chỉ được đánh giá một lần
reviewSchema.index({ bookingId: 1, userId: 1 }, { unique: true });

// Đánh giá công khai của một khách sạn, mới nhất trước
reviewSchema.index({ hotelId: 1, status: 1, createdAt: -1 });

// Đánh giá của một người dùng
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
