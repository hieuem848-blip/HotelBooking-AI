import * as authService from "../services/auth.service.js";
import * as otpService from "../services/otp.service.js";

// Controller chỉ nhận request và trả response; nghiệp vụ nằm trong services/
// Express 5 tự chuyển lỗi của hàm async tới error handler trong server.js

export const requestOtp = async (req, res) => {
  const { expiresIn } = await otpService.requestOtp(req.body.email);

  res.json({
    success: true,
    message: `Mã xác nhận đã được gửi đến ${req.body.email}. Nếu không thấy, hãy kiểm tra hộp thư rác.`,
    expiresIn,
  });
};

export const verifyOtp = async (req, res) => {
  const session = await authService.loginWithEmailOtp(req.body.email, req.body.code);
  res.json({ success: true, message: "Đăng nhập thành công.", ...session });
};

export const staffLogin = async (req, res) => {
  const session = await authService.loginStaff(req.body.email, req.body.password);
  res.json({ success: true, message: "Đăng nhập thành công.", ...session });
};

export const googleLogin = async (req, res) => {
  const session = await authService.loginWithGoogle(req.body.credential);
  res.json({ success: true, message: "Đăng nhập bằng Google thành công.", ...session });
};

export const facebookLogin = async (req, res) => {
  const session = await authService.loginWithFacebook(req.body.accessToken);
  res.json({ success: true, message: "Đăng nhập bằng Facebook thành công.", ...session });
};

export const me = (req, res) => res.json({ success: true, user: req.user });
