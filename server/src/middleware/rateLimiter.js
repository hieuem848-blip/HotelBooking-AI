import rateLimit from "express-rate-limit";

const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message },
  });

// Chặt hơn cho API gửi OTP để tránh bị lạm dụng gửi email hàng loạt
export const otpRequestLimiter = createLimiter(
  10,
  "Bạn yêu cầu mã quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại.",
);

export const authLimiter = createLimiter(
  50,
  "Bạn thử đăng nhập quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại.",
);

// Đăng nhập bằng mật khẩu bị chặn chặt hơn để chống dò mật khẩu
export const staffLoginLimiter = createLimiter(
  10,
  "Bạn đăng nhập sai quá nhiều lần. Vui lòng đợi 15 phút rồi thử lại.",
);
