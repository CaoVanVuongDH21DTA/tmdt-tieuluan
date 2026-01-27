import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../store/features/common";
import { Link } from "react-router-dom";
import {
  forgotPasswordAPI,
  verifyOtpFPAPI,
  resendOtpAPI,
  resetPasswordAPI,
} from "../../api/auth/authentication";
import { ChevronLeft, Visibility, VisibilityOff } from "@mui/icons-material";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast"; 

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.commonState.loading);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // --- LOGIC ---
  const handleSendEmail = useCallback(
    (e) => {
      e.preventDefault();
      if (!email.trim()) {
        showCustomToast("Vui lòng nhập email!", "warning");
        return;
      }

      dispatch(setLoading(true));
      forgotPasswordAPI({ email })
        .then((res) => {
          showCustomToast("Mã OTP đã được gửi tới email của bạn");
          setStep(2);
        })
        .catch((err) => {
          showCustomToast(
            err?.response?.data?.message || "Email không tồn tại hoặc lỗi hệ thống",
            "error"
          );
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    },
    [dispatch, email]
  );

  const handleVerifyOtp = useCallback(
    (e) => {
      e.preventDefault();
      if (otp.length < 6) {
        showCustomToast("Mã OTP phải đủ 6 ký tự", "warning");
        return;
      }

      dispatch(setLoading(true));
      verifyOtpFPAPI({ email, otp })
        .then((res) => {
          showCustomToast("Xác thực OTP thành công");
          setStep(3);
        })
        .catch((err) => {
          showCustomToast(
            err?.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn",
            "error"
          );
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    },
    [dispatch, email, otp]
  );

  useEffect(() => {
    if (step === 2) {
      setResendCooldown(60);
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = useCallback(() => {
    if (resendCooldown > 0) return;
    
    dispatch(setLoading(true));
    resendOtpAPI({ email })
      .then((res) => {
        showCustomToast("Đã gửi lại mã OTP mới");
        setResendCooldown(30);
      })
      .catch((err) => {
        showCustomToast("Không thể gửi lại OTP, vui lòng thử lại sau", "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch, email, resendCooldown]);

  const handleResetPassword = useCallback(
    (e) => {
      e.preventDefault();
      if (newPassword.length < 6) {
        showCustomToast("Mật khẩu phải có ít nhất 6 ký tự", "warning");
        return;
      }

      dispatch(setLoading(true));
      resetPasswordAPI({ email, newPassword })
        .then((res) => {
          showCustomToast("Đổi mật khẩu thành công!");
          setStep(4);
        })
        .catch((err) => {
          showCustomToast(
            err?.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu",
            "error"
          );
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    },
    [dispatch, email, newPassword]
  );

  return (
    <div className="w-full">
      {step === 1 && (
        <Link
          to="/auth/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ChevronLeft fontSize="small" /> Quay lại đăng nhập
        </Link>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {step === 1 && "Quên mật khẩu?"}
          {step === 2 && "Xác thực OTP"}
          {step === 3 && "Đặt lại mật khẩu"}
          {step === 4 && "Hoàn tất!"}
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {step === 1 && "Đừng lo, hãy nhập email để lấy lại mật khẩu."}
          {step === 2 && `Mã OTP 6 số đã được gửi tới email của bạn.`}
          {step === 3 && "Hãy nhập mật khẩu mới thật mạnh nhé."}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email đăng ký
            </label>
            <input
              type="email"
              required
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Gửi mã xác thực"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã OTP
            </label>
            <input
              type="text"
              maxLength={6}
              className="w-full h-12 px-4 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Đang xác thực..." : "Xác thực"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isLoading}
              className={`text-sm transition-colors ${
                resendCooldown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-black font-semibold hover:underline"
              }`}
            >
              {resendCooldown > 0
                ? `Gửi lại mã sau ${resendCooldown}s`
                : "Chưa nhận được mã? Gửi lại"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setOtp("");
            }}
            className="w-full text-sm text-gray-500 mt-2 hover:text-black transition-colors"
          >
            Nhập lại Email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-2xl"></span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Thành công!</h3>
          <p className="text-gray-600 mb-6">
            Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây
            giờ.
          </p>
          <Link
            to="/auth/login"
            className="block w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;