import BckgImage from "../assets/img/bg_register.jpg";
import { useSelector } from "react-redux";
import Spinner from "../components/Spinner/Spinner";
import { useLocation, Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoShop } from "../components/logo/logoShop";

const AuthenticationWrapper = () => {
  const location = useLocation();
  const isLoading = useSelector((state) => state?.commonState?.loading);

  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* Cột trái: Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 sm:px-12 xl:px-24 py-12 relative">
        <div className="absolute top-6 left-6 sm:left-12">
           <Link to="/" className="text-xl font-bold tracking-tighter"><LogoShop/></Link>
        </div>

        <div className="w-full max-w-md">
           <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nhỏ */}
        <p className="absolute bottom-6 text-xs text-gray-400">
          © 2025 LaptopStore. All rights reserved.
        </p>
      </div>

      {/* Cột phải: Hình ảnh (Ẩn trên mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900">
        <img
          src={BckgImage}
          alt="Authentication Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Overlay text để hình ảnh không bị trống trải */}
        <div className="relative z-10 flex flex-col justify-end h-full p-16 text-white bg-gradient-to-t from-black/80 via-black/30 to-transparent w-full">
          <h2 className="text-4xl font-bold mb-4">Khám phá phong cách mới</h2>
          <p className="text-lg text-gray-200">Gia nhập cộng đồng mua sắm thời thượng nhất ngay hôm nay.</p>
        </div>
      </div>

      {/* Global Spinner */}
      {isLoading && <Spinner />}
    </div>
  );
};

export default AuthenticationWrapper;