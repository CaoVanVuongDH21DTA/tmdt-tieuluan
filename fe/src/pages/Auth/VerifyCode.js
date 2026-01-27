import { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setLoading } from '../../store/features/common'; 
import { verifyOtpRAPI } from '../../api/auth/authentication'; 
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { resendOtpAPI } from "../../api/auth/authentication";

const VerifyCode = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [countdown, setCountdown] = useState(60); 
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown]);

  const onSubmit = useCallback((e) => {
    e.preventDefault();

    if (otp.length < 6) {
        const msg = 'Vui lòng nhập đủ 6 chữ số.';
        setError(msg);
        showCustomToast(msg, 'error');
        return;
    }

    setError('');
    setIsSubmitting(true);
    dispatch(setLoading(true));

    verifyOtpRAPI({ email, otp })
      .then(res => {
        showCustomToast('Xác nhận tài khoản thành công!', 'success');
        setSuccess(true);
      })
      .catch(err => {
        const errorMsg = 'Mã xác nhận không đúng hoặc đã hết hạn.';
        showCustomToast(errorMsg, 'error');
        setError(errorMsg);
      })
      .finally(() => {
        dispatch(setLoading(false));
        setIsSubmitting(false);
      });
  }, [dispatch, email, otp]);

  const handleOnChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    if (error) setError(''); 
  }, [error]);

  const handleResendOtp = useCallback(() => {
      if (countdown > 0) return;
      
      dispatch(setLoading(true));
      resendOtpAPI({ email })
        .then((res) => {
          showCustomToast("Đã gửi lại mã OTP mới", "success");
          setCountdown(60);
        })
        .catch((err) => {
          showCustomToast("Không thể gửi lại OTP, vui lòng thử lại sau", "error");
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }, [dispatch, email, countdown]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xác nhận!</h2>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn đã sẵn sàng. Bạn sẽ được chuyển hướng hoặc có thể đăng nhập ngay.
          </p>
          <Link 
            to="/auth/login" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-600/30"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  // --- Giao diện Nhập OTP ---
  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Xác thực tài khoản</h1>
            <p className="text-sm text-gray-500 mt-2">
              Chúng tôi đã gửi mã 6 số đến: <br/>
              <span className="font-medium text-blue-600">{email}</span>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Nhập mã OTP
              </label>
              <input
                type="text"
                name="otp"
                value={otp}
                maxLength={6}
                onChange={handleOnChange}
                placeholder="000000"
                className={`block w-full text-center text-3xl font-bold tracking-[0.5em] text-gray-900 border-b-2 focus:outline-none py-2 transition-colors placeholder-gray-200
                  ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'}
                `}
                autoComplete="off"
                required
              />
               {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length < 6}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white 
                ${isSubmitting || otp.length < 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'}
                transition-all duration-200`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xác nhận...
                </div>
              ) : (
                'Xác nhận'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa nhận được mã?{' '}
              {/* Xử lý giao diện nút Gửi lại dựa trên countdown */}
              <button 
                type="button"
                disabled={countdown > 0}
                className={`font-medium transition-colors ${
                    countdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-500 hover:underline'
                }`}
                onClick={handleResendOtp}
              >
                {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyCode;