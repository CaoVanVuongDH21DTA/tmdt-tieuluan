export const UserSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
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

      {/* Search Bar Skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="h-10 bg-gray-200 rounded-lg w-80"></div>
          </div>
        </div>
      </div>

      {/* User Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(6)].map((_, index) => (
                    <th key={index} className="px-4 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Người dùng */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Thông tin liên hệ */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </td>
                    
                    {/* Vai trò */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </td>
                    
                    {/* Trạng thái */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </td>
                    
                    {/* Ngày tham gia */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    
                    {/* Thao tác */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton cho Stats Cards riêng lẻ
export const UserStatsSkeleton = () => {
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

// Skeleton cho User Table riêng lẻ
export const UserTableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Người dùng', 'Thông tin liên hệ', 'Vai trò', 'Trạng thái', 'Ngày tham gia', 'Thao tác'].map((_, index) => (
                  <th key={index} className="px-4 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Người dùng */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Thông tin liên hệ */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </td>
                  
                  {/* Vai trò */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </td>
                  
                  {/* Trạng thái */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </td>
                  
                  {/* Ngày tham gia */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  
                  {/* Thao tác */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
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