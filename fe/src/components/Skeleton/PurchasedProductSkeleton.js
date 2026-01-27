const PurchasedProductSkeleton=()=> {
  return (
    <div className="flex max-h-[200px] bg-gray-100 rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="w-40 h-40 bg-gray-300" />
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
      </div>
    </div>
  );
}

export default PurchasedProductSkeleton;
