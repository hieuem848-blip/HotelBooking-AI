import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Chỉ tài khoản quản trị (ADMIN, HOTEL_OWNER) có mật khẩu; khách hàng đăng nhập bằng OTP, Google, Facebook
    passwordHash: {
      type: String,
      select: false,
    },

    // Liên kết đăng nhập mạng xã hội (unique + sparse: cho phép nhiều tài khoản không có giá trị này)
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["", "MALE", "FEMALE", "OTHER"],
      default: "",
    },

    nationality: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255,
    },

    role: {
      type: String,
      enum: ["CUSTOMER", "HOTEL_OWNER", "ADMIN"],
      default: "CUSTOMER",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    lastLoginAt: {
      type: Date,
    },

    // Tăng số này để vô hiệu hoá mọi token cũ; mặc định không trả về khi truy vấn
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },

    preferences: {
      language: {
        type: String,
        default: "vi",
      },

      currency: {
        type: String,
        default: "VND",
      },

      favoriteDestinations: {
        type: [String],
        default: [],
      },

      preferredRoomTypes: {
        type: [String],
        default: [],
      },

      budgetRange: {
        min: {
          type: Number,
          default: 0,
        },

        max: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
