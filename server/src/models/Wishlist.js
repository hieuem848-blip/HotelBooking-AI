import mongoose from "mongoose";

// Mỗi bản ghi là một cặp (người dùng, khách sạn) đã lưu
const wishlistSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
    collection: "wishlists",
  },
);

// Không cho lưu trùng một khách sạn
wishlistSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

// Lấy danh sách của một người, mới lưu xếp trước
wishlistSchema.index({ userId: 1, createdAt: -1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
