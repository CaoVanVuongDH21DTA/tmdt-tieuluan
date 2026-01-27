package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.auth.dto.OrderResponse;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.entities.UserDiscount;
import com.tieuluan.laptopstore.auth.repositories.UserDiscountRepository;
import com.tieuluan.laptopstore.auth.services.EmailService;
import com.tieuluan.laptopstore.dto.*;
import com.tieuluan.laptopstore.entities.*;
import com.tieuluan.laptopstore.exceptions.BadRequestEx;
import com.tieuluan.laptopstore.exceptions.ResourceNotFoundEx;
import com.tieuluan.laptopstore.mapper.OrderMapper;
import com.tieuluan.laptopstore.repositories.FlashSaleItemRepository;
import com.tieuluan.laptopstore.repositories.OrderRepository;
import com.tieuluan.laptopstore.repositories.ProductRepository;
import com.tieuluan.laptopstore.repositories.ShippingProviderRepository;
import com.tieuluan.laptopstore.repositories.PaymentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private UserDetailsService userDetailsService;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProductService productService;
    @Autowired private OrderMapper orderMapper;
    @Autowired private ShippingProviderRepository shippingProviderRepository;
    @Autowired private EmailService emailService;
    @Autowired private FlashSaleItemRepository flashSaleItemRepository;
    @Autowired private UserDiscountRepository userDiscountRepository;
    @Autowired private PaymentRepository paymentRepository; 
    // =======================================================================
    //  TẠO ĐƠN HÀNG
    // =======================================================================
    @Transactional(rollbackFor = Exception.class) 
    public OrderResponse createOrder(OrderRequest orderRequest, Principal principal) {
        
        // 1. Lấy User & Validate Address/Shipping (Giữ nguyên)
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        Address address = user.getAddressList().stream()
                .filter(addr -> orderRequest.getAddressId().equals(addr.getId()))
                .findFirst().orElseThrow(() -> new BadRequestEx("Địa chỉ không hợp lệ"));
        ShippingProvider shippingProvider = shippingProviderRepository.findById(orderRequest.getShippingProviderId())
                .orElseThrow(() -> new BadRequestEx("Đơn vị vận chuyển không hợp lệ"));

        double subTotal = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        // 2. Xử lý sản phẩm (Stock & Flash Sale)
        for (var itemReq : orderRequest.getOrderItemRequests()) {
            Product product = productService.getProductEntityById(itemReq.getProductId());
            if (product == null) throw new BadRequestEx("Sản phẩm không tồn tại");

            int requestQuantity = itemReq.getQuantity();
            
            // --- XỬ LÝ FLASH SALE ---
            Optional<FlashSaleItem> flashSaleItemOpt = flashSaleItemRepository
                .findActiveSaleByProductId(product.getId(), LocalDateTime.now());

            if (flashSaleItemOpt.isPresent()) {
                FlashSaleItem fsItem = flashSaleItemOpt.get();
                if (fsItem.getSold() + requestQuantity > fsItem.getQuantity()) {
                    throw new BadRequestEx("Sản phẩm '" + product.getName() + "' đã hết suất Flash Sale!");
                }
                fsItem.setSold(fsItem.getSold() + requestQuantity);
                flashSaleItemRepository.saveAndFlush(fsItem);
            }

            // --- XỬ LÝ KHO TỔNG ---
            if (product.getStock() < requestQuantity) {
                throw new BadRequestEx("Sản phẩm '" + product.getName() + "' không đủ số lượng.");
            }
            product.setStock(product.getStock() - requestQuantity);
            productRepository.save(product); 

            // --- TÍNH TIỀN ---
            double finalItemPrice = itemReq.getItemPrice(); 
            subTotal += finalItemPrice * requestQuantity;

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productVariantId(itemReq.getProductVariantId())
                    .quantity(requestQuantity)
                    .itemPrice(finalItemPrice)
                    .build());
        }

        // 3. Xử lý Mã giảm giá
        Discount discount = null;
        UserDiscount userDiscountToUse = null;
        
        if (orderRequest.getDiscountId() != null) {
            UserDiscount userDiscount = userDiscountRepository.findByUserIdAndDiscountId(user.getId(), orderRequest.getDiscountId())
                    .orElseThrow(() -> new BadRequestEx("Mã giảm giá không hợp lệ!"));

            if (userDiscount.isUsed()) throw new BadRequestEx("Mã này đã được sử dụng!");
            
            // Validate ngày tháng... (Giữ nguyên logic của bạn)
            Date now = new Date();
            Discount d = userDiscount.getDiscount();
            if (!d.isActive() || (d.getEndDate() != null && d.getEndDate().before(now))) {
                throw new BadRequestEx("Mã giảm giá đã hết hạn.");
            }
            
            discount = d;
            userDiscountToUse = userDiscount;
        }

        // 4. Set Status
        OrderStatus initialStatus = OrderStatus.PENDING;
        if ("VNPAY".equalsIgnoreCase(orderRequest.getPaymentMethod()) || "CARD".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
            initialStatus = OrderStatus.PENDING_PAYMENT;
        }

        // 5. Build Order & Save
        Order order = Order.builder()
                .user(user)
                .address(address)
                .shippingProvider(shippingProvider)
                .totalAmount(orderRequest.getTotalAmount())
                .discount(discount)
                .orderDate(LocalDateTime.now())
                .expectedDeliveryDate(orderRequest.getExpectedDeliveryDate())
                .paymentMethod(orderRequest.getPaymentMethod())
                .note(orderRequest.getNote())
                .orderStatus(initialStatus)
                .shipmentNumber(generateShipmentNumber(shippingProvider.getName()))
                .build();

        Order finalOrder = order;
        orderItems.forEach(item -> item.setOrder(finalOrder));
        order.setOrderItemList(orderItems);

        // Payment Info
        Payment payment = new Payment();
        payment.setPaymentStatus(PaymentStatus.PENDING_PAYMENT);
        payment.setPaymentDate(new Date());
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // 6. UPDATE MÃ GIẢM GIÁ (FIX BUG COD)
        if (userDiscountToUse != null) {
            userDiscountToUse.setUsed(true);
            userDiscountToUse.setUsedDate(new Date());
            userDiscountRepository.saveAndFlush(userDiscountToUse); 
        }

        // 7. Gửi Email (Async)
        sendEmailAsync(savedOrder, "Đặt hàng thành công", "Đơn hàng đang chờ xử lý.");

        return OrderResponse.builder()
                .paymentMethod(orderRequest.getPaymentMethod())
                .orderId(savedOrder.getId())
                .totalAmount(savedOrder.getTotalAmount())
                .build();
    }

    // =======================================================================
    //  HỖ TRỢ: GỬI EMAIL ASYNC 
    // =======================================================================
    @Async // Cần @EnableAsync ở class Application
    public void sendEmailAsync(Order order, String subject, String content) {
        try {
            emailService.sendOrderStatusEmail(order, subject, content);
        } catch (Exception e) {
            System.err.println("Gửi email thất bại: " + e.getMessage());
        }
    }

    // =======================================================================
    // XỬ LÝ SAU KHI THANH TOÁN ONLINE 
    // =======================================================================
    @Transactional
    public void updateOrderStatusAfterPayment(UUID orderId, String responseCode) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        Payment payment = order.getPayment(); 
        
        if (payment == null) 

        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaymentDate(new Date());
            order.setOrderStatus(OrderStatus.IN_PROGRESS);
            
            paymentRepository.save(payment);
            orderRepository.save(order);
            sendEmailAsync(order, "Thanh toán thành công", "Đã thanh toán.");
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setPaymentDate(new Date());
            paymentRepository.save(payment);

            returnStockAndCoupon(order);
            
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        }
    }

    // =======================================================================
    //  ADMIN — LẤY TOÀN BỘ ĐƠN HÀNG
    // =======================================================================
    public List<OrderDetails> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::mapToOrderDetailsAdmin)
                .collect(Collectors.toList());
    }

    // =======================================================================
    //  USER — LẤY ĐƠN HÀNG THEO USER HIỆN TẠI
    // =======================================================================
    public List<OrderDetails> getOrdersByUser(Principal principal) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        return orderRepository.findByUser(user)
                .stream()
                .map(order -> orderMapper.mapToOrderDetails(order, user))
                .collect(Collectors.toList());
    }

    // =======================================================================
    //  PUBLIC — TRA CỨU ĐƠN HÀNG BẰNG ID + EMAIL
    // =======================================================================
    public OrderDetails findOrderByIdAndEmail(UUID orderId, String email) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return orderMapper.mapToOrderDetails(order, order.getUser());
    }

    // =======================================================================
    //  USER — HỦY ĐƠN HÀNG
    // =======================================================================
    @Transactional
    public void cancelOrder(UUID id, Principal principal) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isAdmin = user.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
        boolean isOwner = order.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Bạn không có quyền hủy đơn này");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã bị hủy hoặc trả về trước đó");
        }
        if (order.getOrderStatus() == OrderStatus.SHIPPED || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Không thể hủy đơn hàng đã giao cho vận chuyển hoặc đã giao thành công");
        }

        returnStockAndCoupon(order);

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        new Thread(() -> {
            emailService.sendOrderStatusEmail(savedOrder, "Đơn hàng đã bị hủy",
                    "Đơn hàng của bạn đã được hủy thành công theo yêu cầu.");
        }).start();
    }

    @Transactional
    public OrderDetails updateOrder(UUID orderId, OrderRequest updateRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundEx("Không tìm thấy đơn hàng"));

        if (updateRequest.getNote() != null) order.setNote(updateRequest.getNote());
        if (updateRequest.getExpectedDeliveryDate() != null) order.setExpectedDeliveryDate(updateRequest.getExpectedDeliveryDate());

        boolean statusChanged = false;
        if (updateRequest.getOrderStatus() != null) {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(updateRequest.getOrderStatus().toUpperCase());
                if (order.getOrderStatus() != newStatus) {
                    boolean isReturningToStock = (newStatus == OrderStatus.CANCELLED);
                    boolean isAlreadyReturned = (order.getOrderStatus() == OrderStatus.CANCELLED);

                    if (isReturningToStock && !isAlreadyReturned) {
                        returnStockAndCoupon(order);
                    }

                    order.setOrderStatus(newStatus);
                    statusChanged = true;
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestEx("Trạng thái đơn hàng không hợp lệ: " + updateRequest.getOrderStatus());
            }
        }

        Order saved = orderRepository.save(order);

        if (statusChanged) {
            new Thread(() -> {
                String msg = "Trạng thái đơn hàng của bạn đã được cập nhật sang: " + translateStatus(saved.getOrderStatus());
                emailService.sendOrderStatusEmail(saved, "Cập nhật đơn hàng", msg);
            }).start();
        }

        return orderMapper.mapToOrderDetailsAdmin(saved);
    }

    private void returnStockAndCoupon(Order order) {
        for (OrderItem item : order.getOrderItemList()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);

                try {
                    Optional<FlashSaleItem> fsItemOpt = flashSaleItemRepository.findActiveSaleByProductId(
                            product.getId(), order.getOrderDate()); 
                    
                    if (fsItemOpt.isPresent()) {
                        FlashSaleItem fsItem = fsItemOpt.get();
                        if (item.getItemPrice() < product.getPrice().doubleValue()) {
                            int newSold = Math.max(fsItem.getSold() - item.getQuantity(), 0);
                            fsItem.setSold(newSold);
                            flashSaleItemRepository.save(fsItem);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Không hoàn được FlashSale count cho sp: " + product.getId());
                }
            }
        }

        if (order.getDiscount() != null) {
            Discount discount = order.getDiscount();
            userDiscountRepository.findByUserIdAndDiscountId(order.getUser().getId(), discount.getId())
                .ifPresent(ud -> {
                    ud.setUsed(false);
                    ud.setUsedDate(null);
                    userDiscountRepository.saveAndFlush(ud);
                    System.out.println("Đã hoàn mã giảm giá cho User: " + order.getUser().getId());
                });
        }
    }

    private String translateStatus(OrderStatus status) {
        switch (status) {
            case PENDING_PAYMENT: return "Chờ thanh toán Online";
            case PENDING: return "Chờ xác nhận";
            case IN_PROGRESS: return "Đã xác nhận";
            case SHIPPED: return "Đang giao hàng";
            case DELIVERED: return "Giao thành công";
            case CANCELLED: return "Đã hủy / Đã trả hàng / Giao thất bại";
            default: return status.name();
        }
    }

    private String generateShipmentNumber(String shippingProviderName) {
        String prefix = shippingProviderName.replaceAll("\\s+", "").toUpperCase();
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefix + "-" + LocalDate.now() + "-" + random;
    }

    // Chạy mỗi 5 phút (300000)
    @Scheduled(fixedRate = 60000)
    public void autoCancelUnpaidOrders() {
        LocalDateTime expiredTime = LocalDateTime.now().minusMinutes(15);
        List<Order> expiredOrders = orderRepository.findByOrderStatusAndPaymentMethodInAndOrderDateBefore(
                OrderStatus.PENDING_PAYMENT, List.of("CARD", "VNPAY"), expiredTime);

        if (!expiredOrders.isEmpty()) {
            System.out.println("Found " + expiredOrders.size() + " expired orders. Processing...");
        }

        for (Order order : expiredOrders) {
            try {
                processCancelSingleOrder(order);
            } catch (Exception e) {
                System.err.println("Lỗi hủy đơn " + order.getId() + ": " + e.getMessage());
            }
        }
    }

    // Helper method chạy transaction riêng lẻ
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processCancelSingleOrder(Order order) {
        returnStockAndCoupon(order);

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null) {
            order.getPayment().setPaymentStatus(PaymentStatus.FAILED);
        }
        orderRepository.save(order);
        
        sendEmailAsync(order, "Đơn hàng bị hủy", "Hủy do quá hạn thanh toán.");
    }
}