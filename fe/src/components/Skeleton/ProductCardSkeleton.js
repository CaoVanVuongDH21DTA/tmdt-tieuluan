import Skeleton from "react-loading-skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="relative bg-white border rounded-xl shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition">
      {/* Hình ảnh */}
      <div className="w-full h-[220px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        <Skeleton height={220} width="100%" />
      </div>

      {/* Nội dung */}
      <div className="mt-4 px-2 w-full text-left">
        {/* Tên sản phẩm */}
        <Skeleton height={20} width="80%" className="mb-2" />

        {/* Mô tả */}
        <Skeleton count={2} height={14} className="mb-2" />

        {/* Giá + Rating */}
        <div className="flex justify-between items-center mt-2">
          <Skeleton height={20} width="40%" />
          <Skeleton height={20} width="60px" />
        </div>
      </div>

      {/* Nút giỏ hàng */}
      <div className="absolute top-3 right-3">
        <Skeleton circle={true} height={40} width={40} />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
