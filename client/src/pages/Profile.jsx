import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const GENDER_OPTIONS = [
  { value: "", label: "Chưa chọn" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const today = new Date().toISOString().slice(0, 10);

const toForm = (profile) => ({
  fullName: profile.fullName || "",
  phone: profile.phone || "",
  dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
  gender: profile.gender || "",
  nationality: profile.nationality || "",
  address: profile.address || "",
});

function Field({ label, className = "", children }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function Profile() {
  const { user, token, login } = useAuth();

  const [profile, setProfile] = useState(user ?? {});
  const [form, setForm] = useState(() => toForm(user ?? {}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy hồ sơ mới nhất từ server (có thêm ngày sinh, giới tính, quốc tịch, địa chỉ)
  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data.user);
        setForm(toForm(data.user));
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Không tải được hồ sơ. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const data = await updateMyProfile(form);

      // Cập nhật lại thông tin đang lưu để Navbar hiện đúng tên mới
      login({ token, user: data.user });
      setProfile(data.user);
      setForm(toForm(data.user));
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const initial = (profile.fullName || profile.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
      <p className="mt-2 text-sm text-slate-500">Cập nhật thông tin tài khoản của bạn.</p>

      {/* Ảnh đại diện lấy từ tài khoản Google / Facebook, không cần nhập */}
      <div className="mt-8 flex items-center gap-4">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.fullName}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl font-bold text-blue-600">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">{profile.fullName}</p>
          <p className="truncate text-sm text-slate-500">{profile.email}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Họ và tên">
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            maxLength={100}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Email">
          <div className="relative">
            <input
              value={profile.email || ""}
              disabled
              className={`${inputClass} bg-slate-50 pr-28 text-slate-500`}
            />

            {profile.emailVerified && (
              <span className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                Đã xác minh
              </span>
            )}
          </div>
        </Field>

        <Field label="Số điện thoại">
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901234567"
            className={inputClass}
          />
        </Field>

        <Field label="Ngày sinh">
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            max={today}
            className={inputClass}
          />
        </Field>

        <Field label="Giới tính">
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Quốc tịch">
          <input
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            maxLength={100}
            placeholder="Việt Nam"
            className={inputClass}
          />
        </Field>

        <Field label="Địa chỉ" className="sm:col-span-2">
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            maxLength={255}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || saving}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
