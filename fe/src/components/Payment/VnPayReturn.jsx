import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showCustomToast } from "../Toaster/ShowCustomToast";
import { clearCart } from "../../store/features/cart";
import { API_BASE_URL, API_URLS, getHeaders } from "../../api/constant";

const VnPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); 
  const [countdown, setCountdown] = useState(5);

  const isCalled = useRef(false);

  // --- GỌI API XÁC THỰC ---
  useEffect(() => {
    if (isCalled.current) return;
    isCalled.current = true;

    const responseCode = searchParams.get("vnp_ResponseCode");

    if (responseCode === "00") {
        const queryString = searchParams.toString();
        const verifyUrl = `${API_BASE_URL}${API_URLS.GET_VNPAY_RETURN}?${queryString}`;

        fetch(verifyUrl, {
            method: 'GET',
            headers: getHeaders()
        })
        .then(async (response) => {
            if (response.ok) {
                setStatus("success");
                dispatch(clearCart());
                
                showCustomToast("Thanh toán thành công!", "success");
            } else {
                setStatus("failed");
                const data = await response.json().catch(() => ({}));
                showCustomToast(data.message || "Lỗi xác thực giao dịch.", "error");
            }
        })
        .catch((err) => {
            setStatus("failed");
            showCustomToast("Lỗi kết nối server.", "error");
        })
        .finally(() => {
            setLoading(false); 
        });

    } else {
        setStatus("failed");
        setLoading(false);
        showCustomToast("Giao dịch bị hủy hoặc thất bại.", "error");
    }
  }, [searchParams, dispatch]);

  // --- ĐẾM NGƯỢC ---
  useEffect(() => {
    if (!status) return;

    if (countdown === 0) {
        if (status === 'success') {
            navigate("/account-details/orders");
        } else {
            navigate("/checkout");
        }
        return;
    }

    const timerId = setInterval(() => {
        setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [status, countdown, navigate]);

  const handleRedirectNow = () => {
      if (status === 'success') navigate("/account-details/orders");
      else navigate("/checkout");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Đang xác thực kết quả thanh toán...</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full transition-all duration-300">
          
          {status === "success" ? (
            <div className="animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-green-600 text-2xl font-bold mb-2">Thanh toán thành công!</h1>
                <p className="text-gray-600 mb-6">Đơn hàng đã được xác nhận.</p>
            </div>
          ) : (
            <div className="animate-fade-in-up">
                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h1 className="text-red-600 text-2xl font-bold mb-2">Thanh toán thất bại!</h1>
                <p className="text-gray-600 mb-6">Giao dịch bị lỗi hoặc đã bị hủy.</p>
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-100">
             <p className="text-sm text-gray-500 mb-4">
                Tự động chuyển hướng sau <span className="font-bold text-blue-600">{countdown}s</span>
             </p>
             
             <button 
                onClick={handleRedirectNow}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                    status === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
             >
                {status === 'success' ? 'Xem đơn hàng ngay' : 'Thử thanh toán lại'}
             </button>
          </div>
      </div>
    </div>
  );
};

export default VnPayReturn;