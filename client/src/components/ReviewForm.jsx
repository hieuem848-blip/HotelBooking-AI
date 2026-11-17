import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";

const RATING_LABELS = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];
const TITLE_MAX = 100;
const COMMENT_MAX = 2000;

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

/**
 * Khung viết / sửa đánh giá.
 * initial: có thì là sửa; onSubmit({ rating, title, comment }); error: lỗi từ server hiện phía trên nút gửi.
 */
function ReviewForm({ hotelName, initial, submitting, error, onSubmit, onClose }) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [localError, setLocalError] = useState("");

  const isEditing = Boolean(initial);
  const shownRating = hovered || rating;

  // Nhấn Esc để đóng (trừ lúc đang gửi)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating) {
      setLocalError("Vui lòng chọn số sao.");
      return;
    }

    setLocalError("");
    onSubmit({ rating, title: title.trim(), comment: comment.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Sửa đánh giá" : "Viết đánh giá"}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isEditing ? "Sửa đánh giá" : "Viết đánh giá"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{hotelName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Chọn sao */}
          <div>
            <p className="text-sm font-medium text-slate-700">Bạn thấy kỳ nghỉ thế nào?</p>

            <div
              role="radiogroup"
              aria-label="Số sao"
              className="mt-2 flex gap-1"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} sao`}
                  onClick={() => {
                    setRating(star);
                    setLocalError("");
                  }}
                  onMouseEnter={() => setHovered(star)}
                  className="rounded p-1"
                >
                  <Star
                    size={32}
                    className={star <= shownRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                  />
                </button>
              ))}
            </div>

            <p className="mt-1 h-5 text-sm text-slate-500">
              {shownRating ? RATING_LABELS[shownRating - 1] : "Chọn số sao"}
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Tiêu đề (không bắt buộc)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="Tóm tắt trải nghiệm của bạn"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Nhận xét (không bắt buộc)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={COMMENT_MAX}
              rows={5}
              placeholder="Chia sẻ chi tiết để giúp du khách khác"
              className={`${inputClass} resize-none`}
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              {comment.length}/{COMMENT_MAX}
            </span>
          </label>

          {(localError || error) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {localError || error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : isEditing ? "Lưu thay đổi" : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;
