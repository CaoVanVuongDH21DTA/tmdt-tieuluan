const OrderSkeleton = () => {
  return (
    <div className="flex justify-between w-full p-4 bg-white rounded-xl shadow-md border border-gray-200 animate-pulse">
      {/* Left side skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-300 rounded w-32"></div> {/* Order #ID */}
        <div className="h-4 bg-gray-300 rounded w-48"></div> {/* Order Date */}
        <div className="h-4 bg-gray-300 rounded w-56"></div> {/* Expected Delivery */}
      </div>

      {/* Right side skeleton */}
      <div className="space-y-2 text-right">
        <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div> {/* Status */}
        <div className="h-4 bg-gray-300 rounded w-20 mx-auto mt-1"></div> {/* Button */}
      </div>
    </div>
  );
};

export default OrderSkeleton;
