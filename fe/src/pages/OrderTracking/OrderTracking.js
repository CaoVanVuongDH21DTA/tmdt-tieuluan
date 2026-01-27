import { useState } from "react";
import { trackOrderAPI } from "../../api/order/order"; 
import { showCustomToast } from '../../components/Toaster/ShowCustomToast';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrder(null);

    try {
      const data = await trackOrderAPI(orderId, email);
      setOrder(data);
      setShowOrderModal(true);
    } catch (err) {
      showCustomToast("Không tìm thấy đơn hàng hoặc thông tin không chính xác", "error");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowOrderModal(false);
  };

  // --- HELPER: Dịch và Style cho trạng thái ---
  const getStatusConfig = (status) => {
    const statusMap = {
      "PENDING": { text: "Chờ xử lý", style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      "IN_PROGRESS": { text: "Đang xử lý", style: "bg-blue-100 text-blue-700 border-blue-200" },
      "SHIPPING": { text: "Đang giao hàng", style: "bg-indigo-100 text-indigo-700 border-indigo-200" },
      "DELIVERED": { text: "Đã giao thành công", style: "bg-green-100 text-green-700 border-green-200" },
      "CANCELLED": { text: "Đã hủy", style: "bg-red-100 text-red-700 border-red-200" },
    };

    // Trả về config hoặc mặc định nếu không tìm thấy key
    return statusMap[status] || { text: status, style: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 py-12 px-4 min-h-[60vh]">
      {/* Form Tra cứu (Giữ nguyên) */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          Tra cứu đơn hàng
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Nhập mã đơn hàng và email để kiểm tra chi tiết vận chuyển.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="orderId" className="block text-sm font-semibold text-gray-700 mb-1">
              Mã đơn hàng
            </label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
              placeholder="VD: ORD-12345"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Địa chỉ email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
              placeholder="tenban@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : "Tra cứu ngay"}
          </button>
        </form>
      </div>

      {/* --- MODAL MỚI --- */}
      {showOrderModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Mã vận đơn:</span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">
                        {order.shipmentNumber || order.id}
                    </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition shadow-sm border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body - Grid Layout */}
            <div className="flex-1 px-6 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- CỘT TRÁI (2/3): DANH SÁCH SẢN PHẨM --- */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Danh sách sản phẩm ({order.orderItemList?.length || 0})
                      </h3>
                    </div>
                    
                    {/* QUAN TRỌNG: 
                        max-h-[300px] hoặc [400px] để giới hạn chiều cao.
                        overflow-y-auto để hiện thanh cuộn khi nội dung dài hơn.
                    */}
                    <div className="divide-y divide-gray-50 overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px', minHeight: '200px' }}>
                      {order.orderItemList?.map((item, index) => (
                        <div key={index} className="p-4 flex gap-4 hover:bg-gray-50 transition group">
                          {/* Ảnh */}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden relative">
                             {item.product?.thumbnail ? (
                                <img 
                                  src={item.product.thumbnail} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                             ) : (
                                <span className="text-2xl">📦</span>
                             )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 line-clamp-2 text-sm md:text-base" title={item.product?.name}>
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {item.product?.category?.name || "Sản phẩm"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              x{item.quantity}
                            </p>
                          </div>

                          {/* Giá */}
                          <div className="text-right whitespace-nowrap">
                            <p className="font-bold text-blue-600 text-sm md:text-base">
                              {item.itemPrice?.toLocaleString()} ₫
                            </p>
                            {item.product?.discount > 0 && (
                                <p className="text-xs text-red-500 line-through mt-1">
                                    {(item.product.price)?.toLocaleString()} ₫
                                </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tổng kết nhanh dưới list sản phẩm (Optional) */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100 text-right">
                        <span className="text-gray-500 text-sm mr-2">Tổng số lượng:</span>
                        <span className="font-semibold text-gray-800">
                            {order.orderItemList?.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm
                        </span>
                    </div>
                  </div>
                </div>

                {/* --- CỘT PHẢI (1/3): THÔNG TIN KHÁC --- */}
                <div className="lg:col-span-1 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  
                  {/* Card 1: Tổng quan đơn hàng */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Trạng thái đơn hàng</h4>
                    
                    {/* Badge Trạng thái */}
                    <div className="mb-4">
                        {(() => {
                            const status = getStatusConfig(order.orderStatus);
                            return (
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${status.style}`}>
                                    <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                                    <span className="font-bold text-sm">{status.text}</span>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngày đặt:</span>
                            <span className="font-medium text-gray-800">
                                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                              <span className="text-gray-500">Dự kiến giao:</span>
                              <span className="font-medium text-green-600">
                                {order.expectedDeliveryDate 
                                    ? new Date(order.expectedDeliveryDate).toLocaleDateString('vi-VN') 
                                    : 'Đang cập nhật'}
                              </span>
                        </div>
                        <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Tổng thanh toán</span>
                            <span className="text-xl font-bold text-blue-600">
                                {order.totalAmount?.toLocaleString()} ₫
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* Card 2: Thông tin giao hàng */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin nhận hàng</h4>
                    
                    <div className="space-y-4">
                        {/* Người nhận */}
                        <div className="flex gap-3">
                            <div className="mt-0.5 text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                            <div>
                                <p className="font-medium text-gray-800">{order.address?.name || "Khách hàng"}</p>
                                <p className="text-sm text-gray-500">{order.address?.phoneNumber}</p>
                                <p className="text-sm text-gray-500">{order.emailUser}</p>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="flex gap-3">
                            <div className="mt-0.5 text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {order.address
                                    ? `${order.address.street}, ${order.address.city}, ${order.address.state}`
                                    : "Chưa cập nhật địa chỉ"}
                            </p>
                        </div>
                        
                        {/* Đơn vị vận chuyển */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                            {order.shippingProvider?.imgShip && (
                                <img src={order.shippingProvider.imgShip} alt="Ship" className="h-8 w-auto object-contain" />
                            )}
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-700">{order.shippingProvider?.name}</p>
                                <p className="text-xs text-gray-500">Tracking: {order.shipmentNumber}</p>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Card 3: Ghi chú */}
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <p className="text-xs font-bold text-yellow-800 uppercase mb-1">
                        Ghi chú đơn hàng:
                    </p>
                    {/* THAY ĐỔI: Đã bỏ  để hiện hết nội dung, vì cột cha đã có scroll */}
                    <p 
                        className="text-sm text-yellow-800 italic line-clamp-3 leading-relaxed break-words" 
                        title={order.note}
                    >
                        "{order.note || "Không có ghi chú"}"
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Đóng
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                Hỗ trợ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking; 