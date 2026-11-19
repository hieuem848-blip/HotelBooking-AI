import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Inventory from "../models/Inventory.js";
import { createNotification } from "../services/notification.service.js";
import * as bookingService from "../services/booking.service.js";

// Xem giá, tồn phòng và mã ưu đãi trước khi đặt (công khai)
export const quoteBooking = async (req, res) => {
    const data = await bookingService.getQuote(res.locals.query);

    res.json({ success: true, data });
};

// Đặt phòng: khách đã đăng nhập (req.user) hoặc khách vãng lai (không có req.user)
export const createBooking = async (req, res) => {
    const data = await bookingService.createBooking(req.user ?? null, req.body);

    res.status(201).json({
        success: true,
        message: "Đặt phòng thành công.",
        data
    });
};

// Khách vãng lai tra cứu đơn bằng mã đặt phòng và email
export const lookupBooking = async (req, res) => {
    const data = await bookingService.lookupBooking(res.locals.query);

    res.json({ success: true, data });
};

export const myBookings = async (req, res) => {
    const data = await Booking.find({
        userId: req.user._id
    })
        .populate("hotelId", "name slug images address")
        .populate("roomTypeId", "name basePrice")
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        data
    });
};

export const getBooking = async (req, res) => {
    const filter = req.user.role === "ADMIN"
        ? { _id: req.params.id }
        : { _id: req.params.id, userId: req.user._id };

    const data = await Booking.findOne(filter)
        .populate("hotelId", "name slug images address policies contact")
        .populate("roomTypeId", "name basePrice capacity bedType images")
        .lean();

    if (!data)
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy đơn đặt phòng."
        });

    res.json({
        success: true,
        data
    });
};

export const markPaid = async (req, res) => {
    const filter = req.user.role === "ADMIN"
        ? { _id: req.params.id }
        : { _id: req.params.id, userId: req.user._id };

    const booking = await Booking.findOneAndUpdate(
        filter,
        {
            paymentStatus: "PAID",
            status: "CONFIRMED"
        },
        { new: true }
    );

    if (!booking)
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy booking."
        });

    await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        {
            status: "SUCCEEDED",
            paidAt: new Date()
        },
        { upsert: true }
    );

    // Lỗi tạo thông báo không được làm hỏng việc thanh toán
    createNotification({
        userId: booking.userId,
        type: "PAYMENT_SUCCESS",
        title: "Thanh toán thành công",
        message: `Booking ${booking.bookingCode} đã được thanh toán.`,
        data: { bookingId: booking._id, hotelId: booking.hotelId }
    }).catch(console.error);

    res.json({
        success: true,
        message: "Thanh toán demo thành công.",
        data: booking
    });
};

export const cancelBooking = async (req, res) => {
    const filter = req.user.role === "ADMIN"
        ? { _id: req.params.id }
        : { _id: req.params.id, userId: req.user._id };

    const booking = await Booking.findOne(filter);

    if (!booking)
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy booking."
        });

    if (["COMPLETED", "CANCELLED"].includes(booking.status))
        return res.status(400).json({
            success: false,
            message: "Booking không thể hủy."
        });

    const dates = [];

    for (
        let d = new Date(booking.checkIn);
        d < booking.checkOut;
        d.setDate(d.getDate() + 1)
    )
        dates.push(new Date(d));

    await Inventory.updateMany(
        {
            roomTypeId: booking.roomTypeId,
            date: { $in: dates }
        },
        {
            $inc: { availableRooms: booking.rooms }
        }
    );

    booking.status = "CANCELLED";

    booking.paymentStatus = booking.paymentStatus === "PAID"
        ? "REFUNDED"
        : "UNPAID";

    await booking.save();

    // Lỗi tạo thông báo không được làm hỏng việc huỷ booking
    createNotification({
        userId: booking.userId,
        type: "BOOKING_CANCELLED",
        title: "Đã huỷ đặt phòng",
        message: `Booking ${booking.bookingCode} đã được huỷ.`,
        data: { bookingId: booking._id, hotelId: booking.hotelId }
    }).catch(console.error);

    res.json({
        success: true,
        message: "Đã hủy booking.",
        data: booking
    });
};

export const allBookings = async (req, res) => {
    const data = await Booking.find({})
        .populate("userId", "fullName email")
        .populate("hotelId", "name")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    res.json({
        success: true,
        data
    });
};