import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, selectAppliedDiscount } from "../../store/features/cart";
import { setLoading } from "../../store/features/common";
import { useNavigate, NavLink } from "react-router-dom";
import { format, addDays } from "date-fns";
import { getAllShipping } from "../../api/ship/shipping";
import { createOrderRequest } from "../../utils/order-util";
import { createOrderAPI, createVnPayPaymentAPI } from "../../api/order/order";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { selectUserInfo } from "../../store/features/user";
import {
  CreditCard,
  LocalShipping,
  LocationOn,
  CalendarToday,
  ShoppingBag,
  Payment,
  Security,
  ArrowBack,
  CheckCircle,
  Add
} from "@mui/icons-material";

const Checkout = () => {
  const cartItems = useSelector(selectCartItems);
  const appliedDiscount = useSelector(selectAppliedDiscount);
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingProviders, setShippingProviders] = useState([]);
  const [shippingPartner, setShippingPartner] = useState(null);
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    const addressList = userInfo?.addressList;
    if (Array.isArray(addressList) && addressList.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addressList[0].id);
    }
  }, [userInfo, selectedAddressId]);

  const deliveryStartDate = addDays(new Date(), 2);
  const deliveryEndDate = addDays(new Date(), 4);
  const formattedDeliveryRange = `${format(deliveryStartDate, "dd")} - ${format(deliveryEndDate, "dd")} tháng ${format(deliveryEndDate, "M")}`;

  // --- TÍNH TỔNG TIỀN HIỂN THỊ ---
  const subTotal = useMemo(() => {
    return cartItems?.reduce((total, item) => {
      return total + (item.subTotal || item.price * item.quantity);
    }, 0) || 0;
  }, [cartItems]);

  const shippingFee = 0;
  const discountValue = appliedDiscount?.value || 0;
  const totalAmount = subTotal + shippingFee - discountValue;

  useEffect(() => {
    const loadShippingProviders = async () => {
      try {
        const data = await getAllShipping();
        setShippingProviders(data);
        if (data.length > 0) {
          setShippingPartner(data[0].id);
        }
      } catch (err) {
        showCustomToast("Không tải được nhà vận chuyển", "warning");
      }
    };
    loadShippingProviders();
  }, []);

  // --- XỬ LÝ THANH TOÁN (COD & CARD) ---
  const handleCheckout = async () => {
    try {
      dispatch(setLoading(true));

      // Truyền thẳng cartItems, hàm createOrderRequest sẽ tự tính giá lại
      const orderRequest = createOrderRequest(
        cartItems, 
        userInfo?.id,
        selectedAddressId,
        shippingPartner,
        paymentMethod,
        orderNote,
        appliedDiscount
      );

      console.log("order: ", orderRequest)

      const res = await createOrderAPI(orderRequest);
      console.log("Đã vào api")

      if (res?.orderId) {
        const beTotal = parseFloat(res.totalAmount);
        const feTotal = parseFloat(totalAmount); 
        
        // Cho phép lệch nhẹ 1000đ do làm tròn
        if (Math.abs(beTotal - feTotal) > 1000) {
             showCustomToast(
                 `Lưu ý: Giá đơn hàng đã thay đổi thành ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(beTotal)} do cập nhật từ hệ thống.`, 
                 "info" 
             );
        }
        if (paymentMethod === "COD") {
            navigate(`/order-return?status=success&orderId=${res.orderId}&amount=${beTotal || feTotal}`);
        } 
        else if (paymentMethod === "CARD") {
            const paymentRes = await createVnPayPaymentAPI(res.orderId);
            const paymentUrl = paymentRes?.paymentUrl || paymentRes;
            if (paymentUrl && typeof paymentUrl === 'string') {
              window.location.href = paymentUrl;
            } else {
              throw new Error("Lỗi URL thanh toán");
            }
        }

      } else {
        throw new Error("Không thể tạo đơn hàng");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Thanh toán thất bại!";
      showCustomToast(msg, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Thanh Toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow-sm mb-4 relative overflow-hidden rounded-sm">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 text-orange-500 pt-2">
                  <LocationOn className="w-5 h-5" />
                  <h2 className="text-lg text-black font-bold capitalize">Địa chỉ nhận hàng</h2>
                </div>

                {userInfo?.addressList && userInfo.addressList.length > 0 ? (
                  /* Wrapper tổng để chứa Danh sách cuộn + Nút cố định */
                  <div>
                    
                    {/* --- KHU VỰC CUỘN (CHỈ CHỨA DANH SÁCH) --- */}
                    <div className="space-y-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {userInfo.addressList.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div key={addr.id} className="flex items-start gap-4 group">
                            {/* Radio Button Logic */}
                            <div className="flex items-center h-6">
                              <input
                                id={`addr-${addr.id}`}
                                name="delivery-address"
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 cursor-pointer accent-orange-500"
                              />
                            </div>

                            {/* Thông tin chi tiết */}
                            <label 
                              htmlFor={`addr-${addr.id}`} 
                              className="flex-1 cursor-pointer flex flex-col md:flex-row md:items-start md:justify-between gap-2"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-bold text-gray-900 text-base">
                                    {addr.name} 
                                    <span className="font-bold text-gray-900 ml-2"> | {addr.phoneNumber}</span>
                                  </span>
                                </div>
                                
                                <div className="text-gray-600 text-sm mb-1">
                                  {addr.street}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  {addr.state}, {addr.city}, {addr.zipCode}
                                </div>
                                {addr.isDefault && (
                                  <div className="mt-2">
                                    <span className="inline-block px-2 py-0.5 border border-orange-500 text-orange-500 text-xs rounded-sm">
                                      Mặc định
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Nút Sửa / Cập nhật */}
                              <NavLink 
                                to="/account-details/profile"
                                className="text-blue-500 text-sm hover:text-orange-500 font-medium px-4 md:px-0 md:text-right w-20"
                              >
                                Cập nhật
                              </NavLink>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {/* --- HẾT KHU VỰC CUỘN --- */}

                    {/* --- NÚT THÊM MỚI (NẰM NGOÀI, KHÔNG BỊ SCROLL) --- */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <NavLink 
                        to="/account-details/profile"
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Add className="w-4 h-4" />
                        Thêm Địa Chỉ Mới
                      </NavLink>
                    </div>

                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <LocationOn className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="mb-4">Bạn chưa có địa chỉ nhận hàng.</p>
                    <NavLink 
                      to="/account-details/profile"
                      className="bg-orange-500 text-white px-6 py-2 rounded-sm hover:bg-orange-600 shadow-sm transition-colors"
                    >
                      Thiết lập địa chỉ
                    </NavLink>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <LocalShipping className="text-green-600 w-6 h-6" />
                <h2 className="text-lg font-semibold text-gray-900">Đơn Vị Vận Chuyển</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {shippingProviders.map((sp) => (
                  <label
                    key={sp.id}
                    className={`flex items-center gap-4 cursor-pointer border-2 rounded-lg p-4 transition-all ${shippingPartner === sp.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="shipping_partner"
                      value={sp.id}
                      checked={shippingPartner === sp.id}
                      onChange={() => setShippingPartner(sp.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {sp.imgShip && (
                      <img
                        src={sp.imgShip}
                        alt={sp.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{sp.name}</p>
                      <p className="text-sm text-gray-600">Miễn phí vận chuyển</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <CalendarToday className="text-orange-600 w-5 h-5" />
                <div>
                  <p className="font-medium text-gray-900">Thời gian giao hàng dự kiến</p>
                  <p className="text-orange-700">{formattedDeliveryRange}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Payment className="text-purple-600 w-6 h-6" />
                <h2 className="text-lg font-semibold text-gray-900">Phương Thức Thanh Toán</h2>
              </div>

              <div className="space-y-4">
                <label className={`flex items-center gap-4 cursor-pointer border-2 rounded-lg p-4 transition-all ${paymentMethod === "CARD" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <CreditCard className="text-gray-600 w-8 h-8" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Thẻ Tín Dụng/Ghi Nợ</p>
                    <p className="text-sm text-gray-600">Thanh toán an toàn qua cổng VNPay</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 cursor-pointer border-2 rounded-lg p-4 transition-all ${paymentMethod === "COD" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <ShoppingBag className="text-gray-600 w-8 h-8" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Thanh Toán Khi Nhận Hàng (COD)</p>
                    <p className="text-sm text-gray-600">Nhận hàng và thanh toán trực tiếp</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Ghi Chú Đơn Hàng (Tùy chọn)</h3>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Ví dụ: Giao hàng giờ hành chính, hướng dẫn địa chỉ..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Payment Action Buttons */}
            {paymentMethod === "COD" && (
              <button
                onClick={handleCheckout}
                disabled={!selectedAddressId || !shippingPartner}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <CheckCircle className="w-6 h-6" />
                ĐẶT HÀNG NGAY
              </button>
            )}

            {paymentMethod === "CARD" && (
              <button
                onClick={handleCheckout}
                disabled={!selectedAddressId || !shippingPartner}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                Thanh Toán Qua VNPay
              </button>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="text-blue-600 w-5 h-5" />
                Tóm Tắt Đơn Hàng
              </h2>

              {/* Products List */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item) => {
                  const finalPrice = item.price;
                  const originalPrice = item.originalPrice;
                  const isDiscounted = originalPrice && originalPrice > finalPrice;

                  
                  return (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</p>
                        <p className="text-gray-600 text-sm">Số lượng: {item.quantity}</p>
                        
                        <div className="flex flex-col">
                          <p className="text-blue-600 font-semibold">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND"
                            }).format(finalPrice)}
                          </p>

                          {isDiscounted && (
                            <p className="text-gray-400 text-xs line-through">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND"
                              }).format(originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subTotal)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({appliedDiscount.code}):</span>
                    <span>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountValue)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>

                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Tổng cộng:</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                <Security className="text-green-600 w-5 h-5" />
                <span className="text-sm text-gray-600">Giao dịch an toàn & bảo mật</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;