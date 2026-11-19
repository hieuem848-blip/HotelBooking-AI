import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

const unauthorized = (res, message) => res.status(401).json({ success: false, message });

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return unauthorized(res, "Vui lòng đăng nhập.");

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select("+tokenVersion").lean();

    // tokenVersion khác nhau nghĩa là token đã bị vô hiệu hoá (ví dụ tài khoản vừa được xác minh lại)
    if (!user || user.status !== "ACTIVE" || (user.tokenVersion ?? 0) !== payload.tokenVersion) {
      return unauthorized(res, "Phiên đăng nhập không còn hợp lệ.");
    }

    const { tokenVersion, ...profile } = user;
    req.user = profile;
    next();
  } catch {
    return unauthorized(res, "Token không hợp lệ hoặc đã hết hạn.");
  }
};

// Cho cả khách vãng lai: không có token thì đi tiếp như khách, có token thì token phải hợp lệ
export const optionalAuthenticate = (req, res, next) =>
  req.headers.authorization ? authenticate(req, res, next) : next();

export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này." });
