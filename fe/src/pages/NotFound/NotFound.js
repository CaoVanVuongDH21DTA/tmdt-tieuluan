import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

const NotFound = () => {
  const error = useRouteError();

  const getMessage = () => {
    if (!error) return "Trang bạn đang tìm kiếm hiện không khả dụng.";

    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return "Trang không tồn tại (404).";
      return `Đã xảy ra lỗi ${error.status}: ${error.statusText}`;
    } else if (error instanceof Error) {
      return error.message || "Đã xảy ra lỗi không xác định.";
    }
    return "Trang bạn đang tìm kiếm hiện không khả dụng.";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Rất tiếc!</h1>
      <p className="text-gray-700 mb-6">{getMessage()}</p>
      <Link
        to="/"
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default NotFound;
