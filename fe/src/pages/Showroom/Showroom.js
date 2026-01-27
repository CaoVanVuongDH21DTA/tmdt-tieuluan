import { useState } from "react";
import {
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

const stores = [
  {
    id: 1,
    name: "TRƯỜNG ĐẠI HỌC NÔNG LÂM",
    address: "Khu phố 6, Phường Linh Trung, Quận Thủ Đức, TP. Hồ Chí Minh",
    hotline: "028.38966780",
    hours: "08:00 - 21:00",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2329.783982346763!2d106.79065663563736!3d10.87132181232418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276398969f7b%3A0x9672b7efd0893fc4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBOw7RuZyBMw6JtIFRQLiBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1759076975886!5m2!1svi!2s",
  },
  {
    id: 2,
    name: "KHOA CÔNG NGHỆ THÔNG TIN",
    address: "Khu phố 6, Phường Linh Trung, Quận Thủ Đức, TP. Hồ Chí Minh",
    hotline: "028.38966780",
    hours: "08:00 - 21:00",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d411.85250140294147!2d106.79119384524705!3d10.870605921764325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752700665a002d%3A0xfc064824c164728b!2zS2hvYSBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbiwgxJBIIE7DtG5nIEzDom0gVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1759077071712!5m2!1svi!2s",
  },
];

const Showroom = () => {
  const [selectedStore, setSelectedStore] = useState(stores[0]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* Tiêu đề */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
          Hệ thống Showroom
        </h1>
        <p className="text-gray-600">
          Các cửa hàng chính thức của chúng tôi – vui lòng chọn showroom để xem bản đồ trực tiếp.
        </p>
      </div>

      {/* Danh sách showroom */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {stores.map((store) => (
          <div
            key={store.id}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
              selectedStore.id === store.id ? "border-2 border-primary" : ""
            }`}
          >
            <h2 className="text-lg font-bold text-dark mb-2 flex items-center">
              <LocationOnIcon/>
              {store.name}
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Địa chỉ:</span> {store.address}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Giờ làm việc:</span> {store.hours}
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium">Hotline:</span> {store.hotline}
            </p>
            <button
              onClick={() => setSelectedStore(store)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition w-full"
            >
              Chỉ đường
            </button>
          </div>
        ))}
      </div>

      {/* Bản đồ Google Maps */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold text-dark mb-4">
          Bản đồ: {selectedStore.name}
        </h3>
        <div className="w-full h-96">
          <iframe
            src={selectedStore.mapUrl}
            className="w-full h-full rounded-lg border-0"
            allowFullScreen=""
            loading="lazy"
            title="Google Maps"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Showroom;
