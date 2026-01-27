import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems } from "../../store/features/cart";
import { NumberInput } from "../../components/NumberInput/NumberInput";
import {
  deleteItemFromCartAction,
  updateItemToCartAction,
} from "../../store/actions/cartAction"; 
import { applyDiscount } from "../../store/features/cart";
import {
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Modal from "react-modal";
import { isTokenValid } from "../../utils/jwt-helper";
import { Link, useNavigate } from "react-router-dom";
import EmptyCart from "../../assets/img/empty_cart.png";
import { selectUserInfo } from "../../store/features/user";
import { getDiscountByUser } from "../../api/discount/discount";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0', 
    border: 'none',
    background: 'none'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
};

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const userInfo = useSelector(selectUserInfo);
  const navigate = useNavigate();

  const onChangeQuantity = useCallback(
    (value, productId, variantId) => {
      const newQuantity = parseInt(value, 10);
      if (isNaN(newQuantity) || newQuantity < 1) return;

      dispatch(
        updateItemToCartAction({
          productId,
          variant_id: variantId,
          quantity: newQuantity,
        })
      );
    },
    [dispatch]
  );

  const onDeleteProduct = useCallback((productId, variantId) => {
    setModalIsOpen(true);
    setDeleteItem({
      productId: productId,
      variantId: variantId,
    });
  }, []);

  const onCloseModal = useCallback(() => {
    setDeleteItem({});
    setModalIsOpen(false);
  }, []);

  const onDeleteItem = useCallback(() => {
    dispatch(deleteItemFromCartAction(deleteItem));
    setModalIsOpen(false);
  }, [deleteItem, dispatch]);

  const subTotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const currentVariant = Array.isArray(item?.variant) ? item.variant[0] : item?.variant;
      const itemPrice = currentVariant?.price ? currentVariant.price : item.price;
      
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems]);

  useEffect(() => {
    if (discountData && subTotal > 0) {
      const calculatedDiscount = Math.min(
        subTotal * (discountData.percentage / 100),
        discountData.maxDiscountAmount
      );
      setDiscountValue(calculatedDiscount);
    } else if (subTotal === 0) {
      setDiscountValue(0);
    }
  }, [subTotal, discountData]);

  const isLoggedIn = useMemo(() => {
    return isTokenValid();
  }, []);

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!userInfo?.id) {
      showCustomToast("Bạn phải đăng nhập để dùng mã.", "warning");
      return;
    }
    if (!couponCode.trim()) {
      showCustomToast("Vui lòng nhập mã giảm giá.", "warning");
      return;
    }

    try {
      const discounts = await getDiscountByUser(userInfo.id);
      const inputCode = couponCode.trim().toLowerCase();
      
      const matched = discounts.find(
        (d) =>
          d.code.toLowerCase() === inputCode &&
          d.active &&
          (!d.startDate || new Date(d.startDate) <= new Date()) &&
          (!d.endDate || new Date(d.endDate) >= new Date()) &&
          !d.usedDate
      );

      if (!matched) {
        showCustomToast("Mã không hợp lệ hoặc hết hạn!", "warning");
        setDiscountData(null);
        setDiscountValue(0);
        return;
      }

      setDiscountData(matched);
      
      const initialDiscountVal = Math.min(
        subTotal * (matched.percentage / 100),
        matched.maxDiscountAmount
      );
       
      dispatch(applyDiscount({
          id: matched.id,
          code: matched.code,
          value: initialDiscountVal
      }));

      showCustomToast(`Áp dụng mã ${matched.code} thành công!`, "success");
    } catch (err) {
      showCustomToast("Lỗi khi áp dụng mã.", "error");
    }
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  return (
    <div className="bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <ShoppingBagIcon className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
              <p className="text-gray-600">{cartItems?.length} sản phẩm trong giỏ hàng</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowBackIcon className="w-5 h-5" />
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>

        {cartItems?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => {
                const currentVariant = Array.isArray(item?.variant) ? item.variant[0] : item?.variant;
                const itemPrice = currentVariant?.price ? currentVariant.price : item.price;
                const sku = currentVariant?.sku;

                return (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <img src={item?.thumbnail} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl" />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">{item?.name}</h3>
                            {sku && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Phân loại: {sku}
                                  </span>
                                </div>
                            )}

                            <p className="text-lg font-bold text-red-600 mb-3">{formatCurrency(itemPrice)}</p>
                          </div>
                          <button onClick={() => onDeleteProduct(item?.productId, item?.variant?.id)} className="text-gray-400 hover:text-red-500 p-2">
                            <DeleteIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <NumberInput
                            max={item?.stock || 99} 
                            min={1}
                            quantity={item?.quantity}
                            onChangeQuantity={(val) => onChangeQuantity(val, item?.productId, item?.variant?.id)}
                          />
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Thành tiền</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(itemPrice * item?.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>

                <div className="mb-6">
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 uppercase"
                      placeholder="Nhập mã giảm giá"
                    />
                    <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                      Áp dụng
                    </button>
                  </form>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(subTotal)}</span>
                  </div>

                  {discountData && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({discountData.code})</span>
                      <span>-{formatCurrency(discountValue)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">MIỄN PHÍ</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(subTotal - discountValue)}</span>
                  </div>
                </div>

                <div className="mt-6">
                    <button
                      onClick={() => isLoggedIn ? navigate("/checkout") : navigate("/auth/login")}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 shadow-lg"
                    >
                      {isLoggedIn ? "Tiến hành thanh toán" : "Đăng nhập để thanh toán"}
                    </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <img
                src={EmptyCart}
                className="w-64 h-64 mx-auto mb-8"
                alt="Giỏ hàng trống"
              />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Hãy khám phá các sản phẩm tuyệt vời và thêm vào giỏ hàng!
              </p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Khám phá sản phẩm ngay</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={onCloseModal}
        style={customStyles}
        contentLabel="Xóa sản phẩm"
        ariaHideApp={false}
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md mx-auto">
            <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <DeleteIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa sản phẩm</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?</p>
            <div className="flex gap-3 justify-center">
                <button
                onClick={onCloseModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                Hủy bỏ
                </button>
                <button
                onClick={onDeleteItem}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                Xóa sản phẩm
                </button>
            </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;