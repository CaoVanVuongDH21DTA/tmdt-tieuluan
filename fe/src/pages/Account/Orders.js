import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../store/features/common';
import { cancelOrderAPI, fetchOrderAPI } from '../../api/user/userInfo';
import { cancelOrder, loadOrders, selectAllOrders } from '../../store/features/user';
import moment from 'moment';
import Timeline from '../../components/Timeline/Timeline';
import { getStepCount } from '../../utils/order-util'; 
import { motion, AnimatePresence } from 'framer-motion';
import OrderSkeleton from "../../components/Skeleton/OrderSkeleton"
import ReviewModal from './Modal/ReviewModal';
import {
  ShoppingBag,
  FilterList,
  Cancel,
  CheckCircle,
  LocalShipping,
  Inventory,
  Schedule,
  ExpandMore,
  ExpandLess,
  RateReview,
  AssignmentReturn,
  Description,
  PhoneInTalk
} from '@mui/icons-material';

const Orders = () => {
  const dispatch = useDispatch();
  const allOrders = useSelector(selectAllOrders);
   
  const [selectedFilter, setSelectedFilter] = useState('ACTIVE');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);

  // --- STATE CHO REVIEW ---
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [productToReview, setProductToReview] = useState(null);

  // Hàm fetch data
  const fetchMyOrders = useCallback(() => {
    dispatch(setLoading(true));
    setLoadingSkeleton(true);
    fetchOrderAPI()
      .then(res => dispatch(loadOrders(res)))
      .catch(err => console.error("Lỗi load đơn hàng:", err))
      .finally(() => {
        setLoadingSkeleton(false)
        dispatch(setLoading(false))
      });
  }, [dispatch]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  useEffect(() => {
    if (!allOrders) return;

    const displayOrders = allOrders.map(order => {
      const rawStatus = order?.orderStatus ? order.orderStatus.toUpperCase() : '';
      let groupStatus = 'ACTIVE';

      // 1. Nhóm Đang thực hiện: Pending, In Progress (chuẩn bị), Shipped (giao)
      if (['PENDING_PAYMENT', 'PENDING', 'IN_PROGRESS', 'SHIPPED'].includes(rawStatus)) {
        groupStatus = 'ACTIVE';
      } 
      // 2. Nhóm Hoàn thành: Delivered
      else if (['DELIVERED'].includes(rawStatus)) {
        groupStatus = 'COMPLETED';
      } 
      // 3. Nhóm Hủy: Cancelled
      else if (['CANCELLED'].includes(rawStatus)) {
        groupStatus = 'CANCELLED';
      }

      return {
        id: order?.id,
        orderDate: order?.orderDate,
        orderStatus: rawStatus,
        status: groupStatus,
        items: order?.orderItemList?.map(item => ({
            id: item?.id,
            productId: item?.product?.id,
            name: item?.product?.name,
            price: item?.itemPrice || item?.product?.price,
            quantity: item?.quantity,
            url: item?.product?.resources?.[0]?.url,
            slug: item?.product?.slug,
            reviewed: item?.reviewed,
        })),
        totalAmount: order?.totalAmount,
        note: order?.note,
        paymentMethod: order?.paymentMethod,
        expectedDeliveryDate: order?.expectedDeliveryDate
      };
    });

    displayOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    setOrders(displayOrders);
  }, [allOrders]);

  const handleOnChange = useCallback((evt) => {
    setSelectedFilter(evt?.target?.value);
  }, []);

  const onCancelOrder = useCallback((id) => {
    if(!window.confirm("Bạn chắc chắn muốn hủy đơn này? Hành động này không thể hoàn tác.")) return;

    dispatch(setLoading(true));
    cancelOrderAPI(id)
      .then(() => {
        dispatch(cancelOrder(id));
      })
      .catch((err) => alert(err.response?.data?.message || "Hủy đơn thất bại"))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  const handleOpenReview = (item) => {
    setProductToReview({
        ...item,
        id: item.productId
    });
    setReviewModalOpen(true);
  };

  const translateStatus = (status, paymentMethod) => {
    if (status === 'PENDING_PAYMENT') {
      return 'Chờ thanh toán (Online)';
    }

    if (status === 'PENDING') {
      return paymentMethod?.toUpperCase()?.includes('COD')
        ? 'Chờ xác nhận (COD)'
        : 'Chờ xác nhận';
    }

    const statusMap = {
      IN_PROGRESS: 'Đang chuẩn bị hàng',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Giao thành công',
      CANCELLED: 'Đã hủy'
    };

    return statusMap[status] || status;
  };

  const translatePaymentMethod = (method) => {
    if (!method) return 'Thanh toán khi nhận hàng (COD)';
    const m = method.toUpperCase();
    if (m.includes('COD')) return 'Thanh toán khi nhận hàng (COD)';
    if (m.includes('VN_PAY') || m.includes('VNPAY')) return 'Thanh toán qua VNPAY';
    if (m.includes('PAYPAL')) return 'Thanh toán qua PayPal';
    if (m.includes('MOMO')) return 'Thanh toán qua MoMo';
    return method;
  };

  // --- [UPDATED] ICON ---
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Schedule className="w-5 h-5 text-orange-500" />; 
      case 'PENDING':
        return <Inventory className="w-5 h-5 text-yellow-500" />; 
      case 'IN_PROGRESS':
        return <Inventory className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED':
        return <LocalShipping className="w-5 h-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <Cancel className="w-5 h-5 text-red-500" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => order.status === selectedFilter);

  return (
    <div className='max-w-6xl mx-auto p-4 lg:p-6 bg-gray-50/50'>       
      {productToReview && (
        <ReviewModal 
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          product={productToReview}
          onSuccess={fetchMyOrders}
        />
      )}

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            Đơn Hàng Của Tôi 
          </h1>
          <p className='text-gray-500 mt-1'>Quản lý và theo dõi tiến độ đơn hàng</p>
        </div>
        
        <div className='flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm'>
          <FilterList className="w-5 h-5 text-gray-400 ml-2" />
          <select
            className='px-3 py-2 bg-transparent outline-none text-gray-700 font-medium cursor-pointer hover:text-blue-600 transition-colors'
            value={selectedFilter}
            onChange={handleOnChange}
          >
            <option value='ACTIVE'>Đang thực hiện</option>
            <option value='COMPLETED'>Lịch sử mua hàng</option>
            <option value='CANCELLED'>Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loadingSkeleton ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 text-center max-w-sm">
            {selectedFilter === 'ACTIVE' ? 'Bạn không có đơn hàng nào đang được xử lý.'
              : selectedFilter === 'CANCELLED' ? 'Lịch sử hủy đơn trống.'
              : 'Hãy mua sắm để lấp đầy danh sách này nhé!'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isSelected = selectedOrder === order.id;
            const canReview = ['DELIVERED'].includes(order.orderStatus); 
            const canCancel = ['PENDING_PAYMENT', 'PENDING', 'IN_PROGRESS'].includes(order.orderStatus); 

            return (
              <motion.div
                layout
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isSelected ? 'shadow-lg border-blue-200' : 'shadow-sm border-gray-200 hover:border-blue-300'}`}
              >
                {/* 1. ORDER SUMMARY CARD */}
                <div 
                  className='p-5 cursor-pointer' 
                  onClick={() => setSelectedOrder(isSelected ? '' : order.id)}
                >
                  <div className='flex flex-col md:flex-row gap-6'>
                     
                    {/* Icon & ID */}
                    <div className='flex items-start gap-4 flex-1'>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getStatusColor(order.orderStatus)} bg-opacity-20`}>
                        {getStatusIcon(order.orderStatus)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className='font-bold text-gray-900 text-lg truncate max-w-[200px]'>
                            #{order.id}
                          </span>
                          <span className='text-gray-400 text-sm'>•</span>
                          <span className='text-gray-500 text-sm'>
                            {moment(order.orderDate).format('HH:mm - DD/MM/YYYY')}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}>
                            {translateStatus(order.orderStatus, order.paymentMethod)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total & Action */}
                    <div className='flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2'>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Tổng thanh toán</span>
                        <span className="text-lg font-bold text-blue-600">
                          {order.totalAmount?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <button className={`text-sm flex items-center gap-1 font-medium transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                        {isSelected ? 'Thu gọn' : 'Chi tiết'} 
                        {isSelected ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. EXPANDED DETAILS */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50/30"
                    >
                      {/* === A. TIMELINE ===  */}
                      {['PENDING_PAYMENT', 'PENDING', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus) && (
                          <div className="p-6 border-b border-gray-100 bg-white">
                            <h4 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                              <LocalShipping fontSize="small" className="text-blue-500"/> 
                              Tiến độ đơn hàng
                            </h4>
                            <div className="px-2 md:px-10">
                              {/* Đảm bảo getStepCount đã cập nhật key IN_PROGRESS */}
                              <Timeline stepCount={getStepCount[order.orderStatus]} />
                            </div>
                          </div>
                      )}

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* === B. LIST SẢN PHẨM === */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                            <Description fontSize="small" className="text-blue-500"/>
                            Sản phẩm ({order.items?.length})
                          </h4>
                           
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[430px] overflow-y-auto custom-scrollbar">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-100 flex-shrink-0 overflow-hidden">
                                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <h5 className="font-medium text-gray-900 line-clamp-2 text-sm" title={item.name}>{item.name}</h5>
                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={item.slug}>
                                      Phân loại: {item.slug || 'Tiêu chuẩn'}
                                    </p>
                                  </div>
                                  
                                  <div className="flex justify-between items-end mt-2">
                                    <div className="text-sm">
                                      <span className="text-gray-500">x{item.quantity}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block font-semibold text-gray-900">
                                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                      </span>
                                      {item.quantity > 1 && (
                                        <span className="text-xs text-gray-400">
                                          ({item.price.toLocaleString('vi-VN')} ₫ / cái)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {canReview && (
                                  <div className="flex items-center pl-2 border-l border-gray-100">
                                     {canReview && (
                                        <div className="flex items-center pl-2 border-l border-gray-100">
                                          {!item.reviewed ? (
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleOpenReview(item); }}
                                              className="flex flex-col items-center gap-1 text-yellow-600 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-all"
                                              title="Đánh giá sản phẩm"
                                            >
                                              <RateReview fontSize="small" />
                                              <span className="text-[10px] font-bold">Đánh giá</span>
                                            </button>
                                          ) : (
                                            <div className="flex flex-col items-center gap-1 text-green-600 p-2">
                                              <CheckCircle fontSize="small" />
                                              <span className="text-[10px] font-bold">Đã xong</span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* === C. THÔNG TIN & ACTIONS === */}
                        <div className="flex flex-col justify-between gap-4">
                          {/* Thông tin đơn hàng */}
                          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <AssignmentReturn fontSize="small" className="text-gray-400" />
                              Thông tin đơn hàng
                            </h5>

                            <ul className="space-y-3 text-sm">

                              {/* Ngày đặt */}
                              <li className="flex justify-between items-center gap-2">
                                <span className="text-gray-500 shrink-0">Ngày đặt:</span>
                                <span
                                  className="font-medium text-gray-900 truncate max-w-[60%] text-right"
                                  title={moment(order.orderDate).format('DD/MM/YYYY')}
                                >
                                  {moment(order.orderDate).format('DD/MM/YYYY')}
                                </span>
                              </li>

                              {/* Phương thức thanh toán */}
                              <li className="flex justify-between items-start gap-2">
                                <span className="text-gray-500 shrink-0">Thanh toán:</span>
                                <span
                                  className="font-medium text-gray-900 text-right truncate max-w-[60%]"
                                  title={translatePaymentMethod(order.paymentMethod)}
                                >
                                  {translatePaymentMethod(order.paymentMethod)}
                                </span>
                              </li>

                              {/* Tổng tiền */}
                              <li className="pt-2 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-gray-500 shrink-0">Tổng tiền:</span>

                                <div className="relative group max-w-[65%] text-right">
                                  <span className="font-bold text-xl text-blue-600 truncate cursor-pointer block">
                                    {order.totalAmount?.toLocaleString('vi-VN')} ₫
                                  </span>

                                  <div className="absolute -top-9 right-0 
                                                  bg-gray-900 text-white text-sm px-2 py-1 rounded
                                                  opacity-0 group-hover:opacity-100 transition
                                                  whitespace-nowrap pointer-events-none z-10">
                                    Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN')} ₫
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>

                          {/* Ghi chú */}
                          {order.note && (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm overflow-hidden">
                              <span className="font-semibold text-yellow-800 block mb-1">
                                Ghi chú:
                              </span>
                              <p
                                className="text-yellow-700 italic line-clamp-3 break-words"
                                title={order.note}
                              >
                                {order.note}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="space-y-3">
                            {canCancel ? (
                              <button
                                onClick={() => onCancelOrder(order.id)}
                                className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <Cancel fontSize="small" />
                                Hủy đơn hàng
                              </button>
                            ) : (
                              ['SHIPPED', 'DELIVERED'].includes(order.orderStatus) && (
                                <div className="text-center text-xs text-gray-400 italic">
                                  * Đơn hàng đang giao/đã nhận, không thể hủy.
                                </div>
                              )
                            )}

                            <a
                              href="tel:19001234"
                              className="w-full p-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-4"
                            >
                              <PhoneInTalk fontSize="small" />
                              Liên hệ hỗ trợ (1900.1234)
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;