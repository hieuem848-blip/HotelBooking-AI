import { CalendarDays, Clock3, ShieldCheck, Users } from "lucide-react";
import { formatDate, formatMoney } from "../../utils/booking";

// Tóm tắt đơn đặt phòng: phòng, ngày ở, số khách và bảng giá do server tính
function BookingSummary({ quote, form, loading }) {
  const { hotel, roomType, pricing, nights } = quote;
  const hasDates = Boolean(form.checkIn && form.checkOut);

  return (
    <aside className="rounded-3xl bg-slate-900 p-7 text-white">
      {hotel.image && <img src={hotel.image} alt={hotel.name} className="h-56 w-full rounded-2xl object-cover" />}

      <h2 className="mt-5 text-2xl font-bold">{hotel.name}</h2>

      <p className="mt-1 text-slate-400">
        {roomType.name}
        {hotel.city && ` · ${hotel.city}`}
      </p>

      <ul className="mt-6 space-y-3 text-sm text-slate-300">
        <li className="flex gap-3">
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-slate-400" />
          {hasDates
            ? `${formatDate(form.checkIn)} → ${formatDate(form.checkOut)}${nights ? ` (${nights} đêm)` : ""}`
            : "Chọn ngày nhận và trả phòng"}
        </li>

        <li className="flex gap-3">
          <Users size={18} className="mt-0.5 shrink-0 text-slate-400" />
          {form.rooms} phòng · {form.adults + form.children} khách (tối đa {roomType.capacity.total} khách/phòng)
        </li>

        {hotel.checkInTime && hotel.checkOutTime && (
          <li className="flex gap-3">
            <Clock3 size={18} className="mt-0.5 shrink-0 text-slate-400" />
            Nhận phòng từ {hotel.checkInTime} · Trả phòng trước {hotel.checkOutTime}
          </li>
        )}

        {hotel.cancellationPolicy && (
          <li className="flex gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-400" />
            {hotel.cancellationPolicy}
          </li>
        )}
      </ul>

      <div className="mt-6 border-t border-slate-700 pt-6">
        {pricing ? (
          <>
            <div className="flex justify-between gap-4 text-sm text-slate-300">
              <span>
                Giá phòng · {pricing.nights} đêm × {pricing.rooms} phòng
              </span>
              <span>{formatMoney(pricing.subtotal)}</span>
            </div>

            <p className="mt-1 text-xs text-slate-500">Trung bình {formatMoney(pricing.pricePerNight)} / đêm / phòng</p>

            {pricing.discount > 0 && (
              <div className="mt-3 flex justify-between gap-4 text-sm text-emerald-400">
                <span>Mã ưu đãi {pricing.couponCode}</span>
                <span>-{formatMoney(pricing.discount)}</span>
              </div>
            )}

            <div className="mt-4 flex items-end justify-between gap-4">
              <span className="text-slate-400">Tổng cộng</span>
              <span className="text-3xl font-bold">{formatMoney(pricing.total)}</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold">
              {formatMoney(roomType.basePrice)} <span className="text-base font-normal text-slate-400">/ đêm</span>
            </p>
            <p className="mt-2 text-sm text-slate-400">Chọn ngày nhận và trả phòng để xem tổng tiền.</p>
          </>
        )}

        {loading && <p className="mt-3 text-xs text-slate-500">Đang cập nhật giá...</p>}
      </div>
    </aside>
  );
}

export default BookingSummary;
