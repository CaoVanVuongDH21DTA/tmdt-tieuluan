const PriceRangeSkeleton = () => (
  <div className="mt-5 animate-pulse">
    <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
    <div className="h-2 bg-gray-200 rounded mb-3 w-full"></div>
    <div className="flex gap-2">
      <div className="h-8 w-12 bg-gray-200 rounded"></div>
      <div className="h-8 w-12 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default PriceRangeSkeleton;