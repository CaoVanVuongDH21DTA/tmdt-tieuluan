export const createOrderRequest = (
    cartItems,
    userId,
    addressId,
    shippingProviderId,
    paymentMethod,
    orderNote,
    appliedDiscount
) => {

    let request = {
        userId,
        addressId,
        orderDate: new Date(),
        paymentMethod,
        shippingProviderId,
        note: orderNote
    };

    let orderItems = [];
    let amount = 0;

    cartItems?.forEach((item) => {
        const itemPrice = item.price;
        const quantity = item.quantity || 1;
        const itemTotal = itemPrice * quantity;

        amount += itemTotal;

        orderItems.push({
            productId: item.productId,
            productVariantId: item?.variant?.id || null,
            quantity: quantity,
            itemPrice: itemPrice,
            subTotal: itemTotal,
            discountPercent: item.originalPrice
                ? Math.round(((item.originalPrice - itemPrice) / item.originalPrice) * 100)
                : 0
        });
    });

    let finalTotalAmount = amount;

    if (appliedDiscount?.value) {
        finalTotalAmount -= appliedDiscount.value;
        request.discountId = appliedDiscount.id;
    }

    request.orderItemRequests = orderItems;
    request.totalAmount = Math.max(0, finalTotalAmount);
    
    const deliveryEndDate = new Date();
    deliveryEndDate.setDate(deliveryEndDate.getDate() + 4);
    request.expectedDeliveryDate = deliveryEndDate;

    return request;
};


export const getStepCount = {
    'PENDING_PAYMENT': 1,
    'PENDING': 1,
    'IN_PROGRESS': 2,
    'SHIPPED': 3,
    'DELIVERED': 4,
    'CANCELLED': 0
};