import { useState, useRef, useEffect } from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export const AddressDropdown = ({ addresses, selectedAddressId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="border p-3 rounded cursor-pointer bg-white" onClick={() => setIsOpen(!isOpen)}>
        {selectedAddress ? (
          <div>
            <p className="font-semibold">Tên người nhận: {selectedAddress.name}</p>
            <p>Số điện thoại: {selectedAddress.phoneNumber}</p>
            <p>Địa chỉ: {selectedAddress.street}</p>
            <p>
              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Chưa chọn địa chỉ giao hàng</p>
        )}

        <NavigateNextIcon
          className={`absolute top-3 right-4 transition-transform duration-500 ease-in-out ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border rounded shadow-md z-10 max-h-60 overflow-auto">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => {
                onChange(addr.id);
                setIsOpen(false);
              }}
            >
              <p className="font-semibold">Tên người nhận: {addr.name}</p>
              <p>Số điện thoại: {addr.phoneNumber}</p>
              <p>Địa chỉ: {addr.street}</p>
              <p>
                {addr.city}, {addr.state} {addr.zipCode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
