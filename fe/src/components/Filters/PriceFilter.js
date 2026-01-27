import React, { useState, useEffect, useRef } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import "./PriceFilter.css";

// Hàm format số đẹp hơn
const formatCurrency = (value, compact = false) => {
  if (compact) {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace(".0", "") + "tr ₫";
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(".0", "") + "k ₫";
    }
  }
  return value.toLocaleString("vi-VN") + " ₫";
};

const PriceFilter = ({ min = 0, max = 1000, onChange }) => {
  const [range, setRange] = useState({ min, max });
  const leftRef = useRef(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setRange({ min, max });
  }, [min, max]);

  // Theo dõi chiều ngang của ô input để đổi format
  useEffect(() => {
    const checkWidth = () => {
      if (leftRef.current) {
        setCompact(leftRef.current.offsetWidth < 120); // nếu nhỏ hơn 120px thì rút gọn
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const handleChange = (values) => {
    const newRange = { min: values[0], max: values[1] };
    setRange(newRange);
    onChange && onChange(newRange);
  };

  return (
    <div className="flex flex-col mb-4">
      <p className="text-[16px] text-black mt-5 mb-5">Giá (VNĐ)</p>
      <RangeSlider
        className="custom-range-slider"
        min={min}
        max={max}
        value={[range.min, range.max]}
        onInput={handleChange}
      />

      <div className="flex justify-between gap-4 mt-4">
        <div
          ref={leftRef}
          className="border rounded-lg h-10 w-1/2 flex items-center px-3 bg-gray-50"
        >
          <input
            type="text"
            value={formatCurrency(range.min, compact)}
            className="outline-none w-full text-gray-800 font-medium text-[14px] text-center bg-transparent"
            disabled
          />
        </div>
        <div className="border rounded-lg h-10 w-1/2 flex items-center px-3 bg-gray-50">
          <input
            type="text"
            value={formatCurrency(range.max, compact)}
            className="outline-none w-full text-gray-800 font-medium text-[14px] text-center bg-transparent"
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
