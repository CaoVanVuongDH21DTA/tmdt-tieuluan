export const OrderSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-7 bg-gray-200 rounded w-1/2 mb-2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-80"></div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(8)].map((_, index) => (
                  <th key={index} className="px-4 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Mã đơn hàng */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  
                  {/* Khách hàng */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </td>
                  
                  {/* Sản phẩm */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </td>
                  
                  {/* Tổng tiền */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  
                  {/* Trạng thái */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </td>
                  
                  {/* Thanh toán */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </td>
                  
                  {/* Ngày đặt */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  
                  {/* Thao tác */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Skeleton cho Stats Cards riêng lẻ
export const OrderStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-7 bg-gray-200 rounded w-1/2 mb-2"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton cho Table riêng lẻ
export const OrderTableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="table-auto w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Ngày đặt', 'Thao tác'].map((_, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};