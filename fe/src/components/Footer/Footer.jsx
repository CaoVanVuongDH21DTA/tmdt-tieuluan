import { useEffect, useState } from "react";
import { getAllShipping } from "../../api/ship/shipping";
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  LocalShipping,
  Payment,
  Facebook,
  Instagram,
  YouTube,
  Twitter
} from "@mui/icons-material";

export default function Footer() {
  const [shipping, setShipping] = useState([]);

  useEffect(() => {
    const fetchShipping = async() =>{
      const data = await getAllShipping();
      if(data) setShipping(data);
    };
    fetchShipping();
  }, []);

  const paymentMethods = [
    {
      name: "COD",
      image: "//theme.hstatic.net/200000722513/1001090675/14/pay_5.png?v=6222"
    },
    {
      name: "VN Pay",
      image: "https://yt3.googleusercontent.com/JM1m2wng0JQUgSg9ZSEvz7G4Rwo7pYb4QBYip4PAhvGRyf1D_YTbL2DdDjOy0qOXssJPdz2r7Q=s900-c-k-c0x00ffffff-no-rj"
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-lg font-bold text-xl mb-6 inline-block">
              LAPTOP<span className="text-orange-400">STORE</span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Chuyên cung cấp laptop và phụ kiện chính hãng với chất lượng tốt nhất. 
              Cam kết giá tốt và dịch vụ hoàn hảo.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <LocationOn className="text-blue-400 text-lg" />
                <span className="text-sm">TPHCM, Việt Nam</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="text-blue-400 text-lg" />
                <span className="text-sm">1900.1234</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Email className="text-blue-400 text-lg" />
                <span className="text-sm">cskh@laptopstore.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <AccessTime className="text-blue-400 text-lg" />
                <span className="text-sm">8:00 - 21:00 (T2 - CN)</span>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-blue-500 pl-3">
              Dịch Vụ Khách Hàng
            </h4>
            <ul className="space-y-3">
              {[
                "Hệ thống cửa hàng",
                "Hướng dẫn mua hàng",
                "Chính sách bảo hành",
                "Chính sách thanh toán",
                "Chính sách giao hàng",
                "Chính sách bảo mật",
                "Tra cứu bảo hành"
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href="/" 
                    className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:bg-orange-400 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-blue-500 pl-3">
              Hỗ Trợ Khách Hàng
            </h4>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="text-green-400 text-lg" />
                  <span className="font-semibold text-white">Mua hàng</span>
                </div>
                <a href="tel:19001234" className="text-2xl font-bold text-green-400 hover:text-green-300 transition-colors">
                  1900.1234
                </a>
                <p className="text-gray-400 text-sm mt-1">(8:00 - 21:00)</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="text-orange-400 text-lg" />
                  <span className="font-semibold text-white">Bảo hành</span>
                </div>
                <a href="tel:19002345" className="text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  1900.2345
                </a>
                <p className="text-gray-400 text-sm mt-1">(8:00 - 21:00)</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Email className="text-red-400 text-lg" />
                  <span className="font-semibold text-white">Khiếu nại</span>
                </div>
                <a href="tel:18003456" className="text-xl font-bold text-red-400 hover:text-red-300 transition-colors">
                  1800.3456
                </a>
                <p className="text-gray-400 text-sm mt-1">(24/7)</p>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-blue-500 pl-3">
              Vận Chuyển & Thanh Toán
            </h4>
            
            {/* Shipping Partners */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <LocalShipping className="text-blue-400 text-lg" />
                <span className="font-semibold">Đối tác vận chuyển</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {shipping.map(ship => (
                  <div 
                    key={ship.id} 
                    className="bg-white rounded-lg p-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <img
                      src={ship.imgShip}
                      alt={ship.name}
                      className="w-full h-8 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Payment className="text-green-400 text-lg" />
                <span className="font-semibold">Phương thức thanh toán</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map((method, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-lg p-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <img
                      src={method.image}
                      alt={method.name}
                      className="w-full h-8 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold">Kết nối với chúng tôi</span>
              </div>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook className="text-blue-400" />, color: "hover:bg-blue-600" },
                  { icon: <Instagram className="text-pink-400" />, color: "hover:bg-pink-600" },
                  { icon: <YouTube className="text-red-400" />, color: "hover:bg-red-600" },
                  { icon: <Twitter className="text-blue-300" />, color: "hover:bg-blue-400" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="/"
                    className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm text-center lg:text-left">
              <p>© 2025 LaptopStore. Tất cả các quyền được bảo lưu.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="//theme.hstatic.net/200000722513/1001090675/14/logo-bct.png?v=6222" 
                  alt="Bộ Công Thương" 
                  className="h-10" 
                />
              </a>
              <div className="text-gray-400 text-xs text-right">
                <p>Đã đăng ký với Bộ Công Thương</p>
                <p>Mã số: 0123456789</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}