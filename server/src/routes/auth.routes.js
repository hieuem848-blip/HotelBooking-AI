import express from "express";
import { facebookLogin, googleLogin, me, requestOtp, staffLogin, verifyOtp } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter, otpRequestLimiter, staffLoginLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import {
  facebookSchema,
  googleSchema,
  otpRequestSchema,
  otpVerifySchema,
  staffLoginSchema,
} from "../utils/authValidators.js";

const router = express.Router();

router.post("/otp/request", otpRequestLimiter, validate(otpRequestSchema), requestOtp);
router.post("/otp/verify", authLimiter, validate(otpVerifySchema), verifyOtp);
router.post("/staff/login", staffLoginLimiter, validate(staffLoginSchema), staffLogin);
router.post("/google", authLimiter, validate(googleSchema), googleLogin);
router.post("/facebook", authLimiter, validate(facebookSchema), facebookLogin);
router.get("/me", authenticate, me);

export default router;
