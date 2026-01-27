export const calculateItemFinalPrice = (product) => {
  if (!product) {
    return {
      finalPrice: 0,
      discountPercent: 0,
      isFlashSale: false,
    };
  }

  // Lấy timestamp (số ms) để so sánh chính xác tuyệt đối
  const now = new Date().getTime();
  const basePrice = Number(product.price) || 0;
  
  // ===== FLASH SALE (ưu tiên cao nhất) =====
  if (product.flashSale) {
    // Chuyển ngày bắt đầu/kết thúc sang số (timestamp) để so sánh
    const startTime = new Date(product.flashSale.startDate).getTime();
    const endTime = new Date(product.flashSale.endDate).getTime();

    // Kiểm tra: Đã bắt đầu VÀ Chưa kết thúc
    if (startTime <= now && endTime > now) {
      const percent = Number(product.flashSale.discountPercent) || 0;
      const finalPrice = Math.round(basePrice * (1 - percent / 100));

      return {
        finalPrice,
        discountPercent: percent,
        isFlashSale: true, 
      };
    }
  }

  // ===== DISCOUNT THƯỜNG =====
  // Nếu không lọt vào if bên trên (do chưa đến giờ hoặc hết giờ), code sẽ chạy xuống đây
  if (product.discount > 0) {
    const percent = Number(product.discount);
    const finalPrice = Math.round(basePrice * (1 - percent / 100));

    return {
      finalPrice,
      discountPercent: percent,
      isFlashSale: false,
    };
  }

  // ===== GIÁ GỐC =====
  return {
    finalPrice: basePrice,
    discountPercent: 0,
    isFlashSale: false,
  };
};