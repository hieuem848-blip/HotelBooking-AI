import express from "express";
import {
  allBookings,
  cancelBooking,
  createBooking,
  getBooking,
  lookupBooking,
  markPaid,
  myBookings,
  quoteBooking,
} from "../controllers/booking.controller.js";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth.js";
import { bookingLimiter, lookupLimiter } from "../middleware/rateLimiter.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { createBookingSchema, lookupQuerySchema, quoteQuerySchema } from "../utils/bookingValidators.js";

const router = express.Router();

// Khách vãng lai dùng được: xem giá, đặt phòng, tra cứu đơn
router.get("/quote", validateQuery(quoteQuerySchema), quoteBooking);
router.get("/lookup", lookupLimiter, validateQuery(lookupQuerySchema), lookupBooking);
router.post("/", optionalAuthenticate, bookingLimiter, validate(createBookingSchema), createBooking);

// Các thao tác còn lại cần đăng nhập
router.use(authenticate);

router.get("/my", myBookings);
router.get("/admin/all", authorize("ADMIN"), allBookings);
router.get("/:id", getBooking);
router.post("/:id/pay", markPaid);
router.post("/:id/cancel", cancelBooking);

export default router;
