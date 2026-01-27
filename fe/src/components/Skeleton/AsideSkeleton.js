import Skeleton from "react-loading-skeleton";

const AsideSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          {/* Tiêu đề danh mục */}
          <Skeleton height={18} width={120} />

          {/* Các loại category */}
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="75%" />
          <Skeleton height={16} width="60%" />
        </div>
      ))}
    </div>
  );
};

export default AsideSkeleton;
