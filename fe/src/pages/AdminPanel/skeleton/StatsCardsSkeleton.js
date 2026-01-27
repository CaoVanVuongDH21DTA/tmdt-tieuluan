export const StatsCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-80 bg-gray-200 rounded-lg"></div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="px-4 py-3">
                <div className="grid grid-cols-6 gap-4">
                  {[...Array(6)].map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};