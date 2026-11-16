import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestOtp, verifyOtp } from "../api/authApi";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { useAuth } from "../context/AuthContext";

const OTP_LENGTH = 6;
const REDIRECT_DELAY_MS = 1000;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const primaryButtonClass =
  "w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Đăng nhập (không có trang đăng ký riêng):
 *  Bước 1: nhập email -> server gửi mã OTP 6 chữ số
 *  Bước 2: nhập mã trong thời gian hiệu lực -> đăng nhập (email mới sẽ tự có tài khoản)
 *  Hoặc đăng nhập bằng Google / Facebook.
 */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Đếm ngược thời gian hiệu lực của mã (cũng là thời gian chờ trước khi gửi lại)
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleLoginSuccess = (data) => {
    login(data);
    setError("");
    setSuccess(data.message);

    // Chuyển về Homepage
    setTimeout(() => {
      navigate("/");
    }, REDIRECT_DELAY_MS);
  };

  const sendCode = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const data = await requestOtp(email.trim());

      setCode("");
      setSecondsLeft(data.expiresIn);
      setStep("code");
    } catch (err) {
      const retryAfter = err.response?.data?.retryAfter;

      // Mã trước vẫn còn hiệu lực: đưa người dùng sang bước nhập mã
      if (retryAfter) {
        setSecondsLeft(retryAfter);
        setStep("code");
      }

      setError(err.response?.data?.message || "Không thể gửi mã. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    sendCode();
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== OTP_LENGTH) {
      setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
      return;
    }

    setError("");

    try {
      setLoading(true);

      const data = await verifyOtp({ email: email.trim(), code });

      handleLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Xác nhận mã thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
    setError("");
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
  };

  const isCodeStep = step === "code";
  const isExpired = isCodeStep && secondsLeft === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>

          <p className="mt-2 text-sm text-slate-500">
            {isCodeStep ? (
              <>
                Nhập mã xác nhận đã gửi đến{" "}
                <span className="font-semibold text-slate-700">{email.trim()}</span>
              </>
            ) : (
              "Đăng nhập vào tài khoản HOTELAI"
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {!isCodeStep ? (
          <>
            {/* Bước 1: nhập email */}
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập email"
                  autoComplete="email"
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className={primaryButtonClass}
              >
                {loading ? "Đang gửi mã..." : "Gửi mã xác nhận"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              hoặc
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google / Facebook */}
            <SocialLoginButtons
              onSuccess={handleLoginSuccess}
              onError={setError}
              disabled={Boolean(success)}
            />

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link to="/" className="font-semibold text-blue-600 hover:text-blue-700">
                Quay về trang chủ
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* Bước 2: nhập mã OTP */}
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mã xác nhận {OTP_LENGTH} chữ số
                </label>

                <input
                  name="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="------"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={OTP_LENGTH}
                  autoFocus
                  className={`${inputClass} text-center text-xl font-semibold tracking-[0.5em]`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || isExpired || Boolean(success)}
                className={primaryButtonClass}
              >
                {loading ? "Đang xác nhận..." : "Xác nhận và đăng nhập"}
              </button>
            </form>

            {/* Gửi lại mã */}
            <div className="mt-6 space-y-2 text-center text-sm text-slate-500">
              {isExpired ? (
                <p>
                  Mã đã hết hạn.{" "}
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={loading || Boolean(success)}
                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-60"
                  >
                    Gửi lại mã
                  </button>
                </p>
              ) : (
                <p>
                  Không nhận được mã? Bạn có thể yêu cầu gửi mã khác sau{" "}
                  <span className="font-semibold text-slate-700">{secondsLeft}</span> giây
                </p>
              )}

              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={Boolean(success)}
                className="font-medium text-slate-600 transition-colors hover:text-blue-600 disabled:opacity-60"
              >
                Đổi email khác
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
