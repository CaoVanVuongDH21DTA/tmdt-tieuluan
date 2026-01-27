import React from 'react';

// Thêm prop width và xử lý class linh hoạt hơn
const Modal = ({ isOpen, onClose, title, children, onSave, saveText = "Lưu", width = "max-w-md" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* SỬA Ở ĐÂY: Thay thế class cứng 'max-w-md' bằng biến 'width' được truyền vào */}
      {/* Thêm 'flex flex-col max-h-[90vh]' để modal không bao giờ cao quá màn hình */}
      <div className={`bg-white rounded-xl shadow-2xl w-full ${width} flex flex-col max-h-[90vh]`}>
        
        {/* Header: Giữ nguyên chiều cao cố định */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Body: Cho phép co giãn (flex-1) và cuộn (overflow-y-auto) */}
        {/* Quan trọng: Bỏ padding ở đây để ProductModal tự xử lý padding bên trong scroll view */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>

        {/* Footer: Giữ nguyên chiều cao cố định */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 shrink-0 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
          >
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;