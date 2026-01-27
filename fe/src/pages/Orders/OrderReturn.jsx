import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle, Error, Home, ReceiptLong, Replay } from "@mui/icons-material";
import { clearCart } from "../../store/features/cart";
import { API_BASE_URL, API_URLS, getHeaders } from "../../api/constant";

const OrderReturn = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  // Ref này chỉ dùng để chặn gọi API 2 lần hoặc Dispatch 2 lần
  const isProcessed = useRef(false);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({
    status: null, // 'success' | 'failed'
    orderId: null,
    amount: 0,
    paymentMethod: "", 
    message: ""
  });

  useEffect(() => {
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const statusParam = searchParams.get("status");
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");

    // --- TRƯỜNG HỢP 1: VNPAY RETURN (Cần gọi API verify) ---
    if (vnpResponseCode) {
      if (isProcessed.current) return; // Chặn gọi API 2 lần
      isProcessed.current = true;
      handleVnPayReturn();
      return;
    } 
    
    // --- TRƯỜNG HỢP 2: COD / TIỀN MẶT (Có params từ Checkout gửi sang) ---
    else if (statusParam === "success" && orderIdParam) {
      // Chỉ dispatch clearCart 1 lần duy nhất
      if (!isProcessed.current) {
         dispatch(clearCart());
         isProcessed.current = true;
      }

      setResult({
        status: "success",
        orderId: orderIdParam,
        amount: parseFloat(amountParam) || 0,
        paymentMethod: "COD - Tiền mặt",
        message: "Đặt hàng thành công!"
      });
      setLoading(false);
    }
    
    // --- TRƯỜNG HỢP 3: LỖI HOẶC KHÔNG CÓ PARAMS ---
    else {
      // Nếu không phải đang loading API của VNPay thì báo lỗi ngay
      if (!vnpResponseCode) {
        setResult({
          status: "failed",
          message: "Thông tin đơn hàng không hợp lệ hoặc thiếu tham số."
        });
        setLoading(false);
      }
    }
  }, [searchParams, dispatch]);

  // --- LOGIC XỬ LÝ API VNPAY ---
  const handleVnPayReturn = () => {
    const responseCode = searchParams.get("vnp_ResponseCode");

    if (responseCode !== "00") {
      setResult({
        status: "failed",
        message: "Giao dịch thanh toán đã bị hủy hoặc thất bại."
      });
      setLoading(false);
      return;
    }

    const queryString = searchParams.toString();
    const verifyUrl = `${API_BASE_URL}${API_URLS.GET_VNPAY_RETURN}?${queryString}`;

    fetch(verifyUrl, {
      method: "GET",
      headers: getHeaders(),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.status === 'success') {
          dispatch(clearCart());
          setResult({
            status: "success",
            orderId: data.orderId || searchParams.get("vnp_TxnRef"),
            amount: (Number(searchParams.get("vnp_Amount")) || 0) / 100, // VNPay amount nhân 100
            paymentMethod: "VNPAY",
            message: "Thanh toán trực tuyến thành công!"
          });
        } else {
          setResult({
            status: "failed",
            message: data.message || "Xác thực giao dịch thất bại."
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setResult({
          status: "failed",
          message: "Lỗi kết nối đến hệ thống xác thực."
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // --- GIAO DIỆN LOADING ---
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Đang xử lý kết quả...</p>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN KẾT QUẢ (MODAL) ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Header Color Background */}
        <div className={`absolute top-0 left-0 w-full h-32 rounded-b-[50%] scale-x-150 -translate-y-10 z-0 ${
          result.status === 'success' 
            ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
            : 'bg-gradient-to-br from-red-400 to-rose-600'
        }`}></div>

        <div className="relative z-10 px-8 pt-12 pb-8 text-center">
          
          {/* Icon Status */}
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
            {result.status === 'success' ? (
              <CheckCircle className="text-green-500 w-12 h-12" />
            ) : (
              <Error className="text-red-500 w-12 h-12" />
            )}
          </div>

          {/* Title & Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {result.status === 'success' ? 'Đặt hàng thành công!' : 'Thất bại!'}
          </h2>
          <p className="text-gray-500 mb-8 font-medium">
            {result.message}
          </p>

          {/* Card Thông tin (Chỉ hiện khi Success) */}
          {result.status === 'success' && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 space-y-4 shadow-inner">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
                <span className="text-gray-500 text-sm">Mã đơn hàng</span>
                <span className="font-bold text-gray-800">#{result.orderId}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Phương thức</span>
                <span className="font-medium text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 text-xs truncate max-w-[150px]">
                  {result.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500 text-sm">Tổng cộng</span>
                <span className="font-bold text-blue-600 text-lg">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(result.amount)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {result.status === 'success' && (
              <Link
                to="/account-details/orders"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                <ReceiptLong className="w-5 h-5" />
                Quản lý đơn hàng
              </Link>
            )}

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl border border-gray-200 transition-colors"
            >
              <Home className="w-5 h-5 text-gray-400" />
              Về trang chủ
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderReturn;