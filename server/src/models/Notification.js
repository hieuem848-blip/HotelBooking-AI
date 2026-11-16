import mongoose from "mongoose";

const NOTIFICATION_TYPES = [
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "CHECK_IN_REMINDER",
  "REVIEW_REMINDER",
  "PROMOTION",
  "SYSTEM",
];

// Code cũ (booking.controller, seed) còn ghi type "BOOKING": tự đổi sang BOOKING_CONFIRMED.
// Có thể bỏ khi mọi nơi tạo thông báo đã dùng loại mới.
const upgradeLegacyType = (value) => (value === "BOOKING" ? "BOOKING_CONFIRMED" : value);

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "SYSTEM",
      set: upgradeLegacyType,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Tuỳ loại thông báo: đặt phòng / thanh toán có bookingId, nhắc đánh giá / khuyến mãi có hotelId
    data: {
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },

      hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "notifications",
  },
);

// Danh sách của một người, mới nhất trước
notificationSchema.index({ userId: 1, createdAt: -1 });

// Lọc thông báo chưa đọc và đếm số chưa đọc
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
