import { useState, useEffect, useRef } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import BannerLaptopImg from "../../assets/img/banner_laptop.jpg";
import BannerGamingImg from "../../assets/img/banner_gaming.jpg";
import BannerOfficeImg from "../../assets/img/banner_office.jpg";
import BannerSmall1 from "../../assets/img/banner_small1.jpg";
import BannerSmall2 from "../../assets/img/banner_small2.jpg";
import AsideShop from "../Aside/AsideShop";

const banners = [
  {
    image: BannerLaptopImg,
    link: "/",
    title: "Laptop Chính Hãng",
    subtitle: "Giảm giá lên đến 30%",
    buttonText: "Mua Ngay",
  },
  {
    image: BannerGamingImg,
    link: "/",
    title: "Gaming Gear",
    subtitle: "Trải nghiệm đỉnh cao",
    buttonText: "Khám Phá",
  },
  {
    image: BannerOfficeImg,
    link: "/",
    title: "Văn Phòng",
    subtitle: "Giải pháp công nghệ",
    buttonText: "Xem Ngay",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (!isHovered) {
      resetTimeout();
      timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
    return () => resetTimeout();
  }, [current, isHovered]);

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const goToSlide = (index) => setCurrent(index);

  return (
    <div className="py-6 px-4">
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* === Cột trái === */}
        <div className="hidden lg:block col-span-3">
          <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <AsideShop />
          </div>
        </div>

        {/* === Banner chính === */}
        <div className="col-span-12 lg:col-span-6">
          <div
            className="relative h-[420px] lg:h-full overflow-hidden rounded-2xl shadow-md group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === current
                    ? "opacity-100 z-10 scale-100"
                    : "opacity-0 z-0 scale-105"
                }`}
              >
                <a href={banner.link} className="block w-full h-full">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent rounded-2xl">
                    <div className="absolute left-8 bottom-10 md:left-12 md:bottom-12 text-white max-w-md">
                      <h2 className="text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-lg tracking-tight">
                        {banner.title}
                      </h2>
                      <p className="text-base md:text-lg mb-6 opacity-90 drop-shadow-md">
                        {banner.subtitle}
                      </p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 md:px-8 md:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md">
                        {banner.buttonText}
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            ))}

            {/* Nút điều hướng */}
            <button
              onClick={prevSlide}
              className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-9 h-9 rounded-full backdrop-blur-sm transition-all duration-300 z-20 items-center justify-center border border-white/30"
            >
              <ArrowBackIosIcon className="text-sm ml-1" />
            </button>
            <button
              onClick={nextSlide}
              className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-9 h-9 rounded-full backdrop-blur-sm transition-all duration-300 z-20 items-center justify-center border border-white/30"
            >
              <ArrowForwardIosIcon className="text-sm" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? "bg-white w-8 shadow-md"
                      : "bg-white/50 w-4 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* === Banner nhỏ bên phải === */}
        <div className="hidden lg:flex flex-col col-span-3 gap-6">
          {[BannerSmall1, BannerSmall2].map((img, idx) => (
            <a
              key={idx}
              href="/"
              className="group relative flex-1 overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-500"
            >
              <img
                src={img}
                alt={`Promo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl flex items-end p-5">
                <div className="text-white">
                  <h3 className="font-semibold text-lg mb-1">
                    {idx === 0 ? "Ưu Đãi Đặc Biệt" : "Sản Phẩm Mới"}
                  </h3>
                  <p className="text-sm opacity-90">
                    {idx === 0 ? "Mua 1 tặng 1" : "Cập nhật hàng tuần"}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
