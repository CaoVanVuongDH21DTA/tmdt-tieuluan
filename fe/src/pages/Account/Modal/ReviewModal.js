import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rating } from '@mui/material';
import { Close, Send, Star } from '@mui/icons-material';
import { addReview } from '../../../api/fetch/fetchReviews';
import { useSelector } from 'react-redux';
import { showCustomToast } from '../../../components/Toaster/ShowCustomToast';

const ReviewModal = ({ isOpen, onClose, product, onSuccess }) => {
  const currentUser = useSelector((state) => state.userState?.userInfo);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return showCustomToast("Vui lòng nhập nội dung đánh giá!", "error");
    
    setIsSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        userId: currentUser?.id,
        rating: rating,
        content: content,
        parentId: null
      });
      showCustomToast("Cảm ơn bạn đã đánh giá!", "success");
      onSuccess(product.id);
      onClose();
    } catch (error) {
      showCustomToast("Gửi đánh giá thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-yellow-500" /> Đánh giá sản phẩm
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <Close />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Product Info Short */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <img src={product.url} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                <p className="text-sm font-medium text-gray-700 line-clamp-2">{product.name}</p>
              </div>

              {/* Rating */}
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 mb-2">Bạn thấy sản phẩm thế nào?</p>
                <Rating 
                  value={rating} 
                  precision={0.5} 
                  onChange={(e, val) => setRating(val)} 
                  size="large"
                />
                <p className="text-yellow-600 font-bold mt-1">{rating} Tuyệt vời</p>
              </div>

              {/* Comment */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
              />
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Gửi đánh giá</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;