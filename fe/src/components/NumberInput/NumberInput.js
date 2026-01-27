import React, { useState, useEffect, useCallback } from 'react';
import { Remove, Add } from '@mui/icons-material';

export const NumberInput = ({ quantity, max = 1, min = 1, onChangeQuantity }) => {
  const [value, setValue] = useState(quantity ?? 1);

  // Đồng bộ state khi props từ Redux thay đổi
  useEffect(() => {
    setValue(quantity);
  }, [quantity]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^[0-9\b]+$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  const handleBlur = () => {
    let newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < min) newValue = min;
    else if (newValue > max) newValue = max;

    setValue(newValue);
    if (newValue !== quantity) {
      onChangeQuantity && onChangeQuantity(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBlur();
  };

  const onIncreaseQuantity = useCallback(() => {
    const currentValue = parseInt(value, 10) || 0;
    const maxValue = parseInt(max, 10) || 999;

    if (currentValue < maxValue) {
      const newValue = currentValue + 1;
      setValue(newValue);
      onChangeQuantity && onChangeQuantity(newValue);
    }
  }, [value, max, onChangeQuantity]);

  const onReduceQuantity = useCallback(() => {
    const currentValue = parseInt(value, 10) || 0;
    if (currentValue > min) {
      const newValue = currentValue - 1;
      setValue(newValue);
      onChangeQuantity && onChangeQuantity(newValue);
    }
  }, [value, min, onChangeQuantity]);

  return (
    <div className="flex justify-center items-center">
      <button
        type="button"
        className="bg-gray-500 w-10 hover:bg-gray-600 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none transition-colors"
        onClick={onReduceQuantity}
      >
        <Remove className="text-white" fontSize="small" />
      </button>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="bg-gray-200 border-x-0 w-16 border-gray-300 h-11 text-center text-gray-900 text-sm block py-2.5 focus:outline-none focus:bg-white transition-colors"
        placeholder="1"
      />
      <button
        type="button"
        className="bg-gray-500 w-10 hover:bg-gray-600 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none transition-colors"
        onClick={onIncreaseQuantity}
      >
        <Add className="text-white" fontSize="small" />
      </button>
    </div>
  );
};