import { CalendarDays, CheckCircle2, CreditCard, MapPin, Star, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getMyBookings, payBooking } from "../api/bookingApi";
import { createReview, getMyReviews } from "../api/reviewApi";
import ReviewForm from "../components/ReviewForm";

const money = (n) => new Intl.NumberFormat("vi-VN").format(n);

const fmt = (d) => new Date(d).toLocaleDateString("vi-VN");

function Bookings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Các đơn đã được đánh giá, đơn đang viết đánh giá
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [reviewing, setReviewing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const load = useCallback(
    () =>
      getMyBookings()
        .then((r) => setData(r.data || []))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getMyReviews()
      .then((r) => setReviewedIds(new Set(r.data.map((x) => String(x.bookingId?._id ?? x.bookingId)))))
      .catch(() => {
        // Không tải được thì vẫn cho viết đánh giá; server sẽ chặn nếu đơn đã đánh giá
      });
  }, []);

  const closeReviewForm = () => {
    setReviewing(null);
    setReviewError("");
  };

  const handleSubmitReview = async (values) => {
    try {
      setSubmitting(true);
      setReviewError("");

      await createReview({ bookingId: reviewing._id, ...values });

      setReviewedIds((prev) => new Set(prev).add(reviewing._id));
      setReviewing(null);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Đơn đặt phòng của tôi</h1>
      <p className="mt-2 text-slate-500">Theo dõi và quản lý các chuyến đi của bạn.</p>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {data.map((b) => (
            <article
              key={b._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row">
                <img
                  src={b.hotelId?.images?.[0]?.url}
                  className="h-40 w-full rounded-xl object-cover md:w-56"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-blue-600">
                        {b.bookingCode}
                      </p>
                      <h2 className="mt-1 text-xl font-bold">{b.hotelId?.name}</h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        b.status === "CANCELLED"
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">{b.roomTypeId?.name}</p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <span className="flex gap-2">
                      <CalendarDays size={16} /> {fmt(b.checkIn)} → {fmt(b.checkOut)}
                    </span>

                    <span className="flex gap-2">
                      <MapPin size={16} /> {b.hotelId?.address?.city}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Tổng tiền</p>
                      <b className="text-xl">{money(b.totalAmount)}đ</b>
                    </div>

                    <div className="flex gap-2">
                      {b.paymentStatus !== "PAID" && b.status !== "CANCELLED" && (
                        <button
                          onClick={() => payBooking(b._id).then(load)}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <CreditCard size={16} />
                          Thanh toán
                        </button>
                      )}

                      {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                        <button
                          onClick={() => cancelBooking(b._id).then(load)}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                        >
                          <XCircle size={16} />
                          Hủy
                        </button>
                      )}

                      {b.status === "COMPLETED" &&
                        (reviewedIds.has(b._id) ? (
                          <Link
                            to="/reviews"
                            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600"
                          >
                            <Star size={16} />
                            Đã đánh giá
                          </Link>
                        ) : (
                          <button
                            onClick={() => setReviewing(b)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white"
                          >
                            <Star size={16} />
                            Viết đánh giá
                          </button>
                        ))}

                      <Link
                        to={`/hotels/${b.hotelId?.slug}`}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                      >
                        Xem khách sạn
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !data.length && (
        <div className="mt-10 rounded-2xl bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">Bạn chưa có đơn đặt phòng.</p>
          <Link to="/hotels" className="mt-4 inline-block text-blue-600">
            Khám phá khách sạn
          </Link>
        </div>
      )}

      {reviewing && (
        <ReviewForm
          hotelName={reviewing.hotelId?.name}
          submitting={submitting}
          error={reviewError}
          onSubmit={handleSubmitReview}
          onClose={closeReviewForm}
        />
      )}
    </div>
  );
}

export default Bookings;
