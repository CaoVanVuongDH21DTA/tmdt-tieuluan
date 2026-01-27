package com.tieuluan.laptopstore.auth.services;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.entities.Order;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    // --- 1. Gửi OTP (Khi người dùng đăng ký tài khoản) ---
    public void sendOtpEmail(User user, String otp) {
        String subject = "Mã xác thực tài khoản LaptopStore";
        
        String contentMain = "<p>Xin chào <b>" + user.getFirstName() +" "+ user.getLastName() + "</b>,</p>"
                + "<p>Bạn vừa yêu cầu mã xác thực để đăng ký. Đây là mã OTP của bạn:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<span style='font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #ffffff; background-color: #007bff; padding: 15px 30px; border-radius: 5px;'>" + otp + "</span>"
                + "</div>"
                + "<p>Mã này sẽ hết hạn trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>";

        String body = buildHtmlTemplate("Xác thực Email", contentMain);

        sendEmail(user.getEmail(), subject, body);
    }

    // --- 2. Gửi thông báo đơn hàng (Giao diện HTML đẹp - Table) ---
    public void sendOrderStatusEmail(Order order, String title, String messageContent) {
        String subject = "[LaptopStore] " + title + " - Mã đơn: #" + order.getShipmentNumber();

        // Format tiền tệ kiểu Việt Nam (10.000.000 đ)
        Locale localeVN = new Locale("vi", "VN");
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(localeVN);
        String totalAmount = currencyFormatter.format(order.getTotalAmount());
        
        // Format ngày tháng
        String orderDate = order.getOrderDate() != null ? 
                           order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "N/A";

        // Tạo nội dung chi tiết đơn hàng
        StringBuilder detailHtml = new StringBuilder();
        detailHtml.append("<p>Xin chào <b>").append(order.getUser().getUsername()).append("</b>,</p>");
        detailHtml.append("<p>").append(messageContent).append("</p>");
        
        // Bảng thông tin đơn hàng
        detailHtml.append("<table style='width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;'>");
        detailHtml.append("<tr style='background-color: #f8f9fa;'>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6;'><b>Mã vận đơn</b></td>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6;'>#").append(order.getShipmentNumber()).append("</td>")
                  .append("</tr>");
        detailHtml.append("<tr>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6;'><b>Ngày đặt hàng</b></td>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6;'>").append(orderDate).append("</td>")
                  .append("</tr>");
        detailHtml.append("<tr style='background-color: #f8f9fa;'>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6;'><b>Trạng thái</b></td>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6; color: #007bff; font-weight: bold;'>").append(order.getOrderStatus()).append("</td>")
                  .append("</tr>");
        detailHtml.append("<tr>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6;'><b>Tổng tiền</b></td>")
                  .append("<td style='padding: 10px; border: 1px solid #dee2e6; color: #dc3545; font-weight: bold; font-size: 16px;'>").append(totalAmount).append("</td>")
                  .append("</tr>");
        detailHtml.append("</table>");
        
        detailHtml.append("<p style='margin-top: 20px;'>Bạn có thể kiểm tra chi tiết đơn hàng tại trang quản lý tài khoản.</p>");

        // Bọc vào template chung
        String body = buildHtmlTemplate("Thông tin đơn hàng", detailHtml.toString());

        sendEmail(order.getUser().getEmail(), subject, body);
    }

    // --- 3. Gửi mật khẩu ngẫu nhiên (Khi người dùng quên mật khẩu) ---
    public void sendRandomPasswordEmail(User user, String randomPassword) {
        String subject = "Cấp lại mật khẩu mới - LaptopStore";
        String headerTitle = "Khôi phục mật khẩu";
        
        // Xử lý tên hiển thị
        String displayName = (user.getFirstName() != null && !user.getFirstName().isEmpty()) 
                             ? user.getFirstName() 
                             : "bạn";

        // Tạo nội dung HTML cụ thể cho mail này
        String contentHtml = "<p>Xin chào <b>" + displayName + "</b>,</p>"
                + "<p>Chúng tôi đã nhận được yêu cầu cấp lại mật khẩu. Đây là mật khẩu mới của bạn:</p>"
                
                // Sử dụng class CSS .highlight-box đã định nghĩa trong buildHtmlTemplate
                + "<div class='highlight-box'>"
                + "  <span class='highlight-text'>" + randomPassword + "</span>"
                + "</div>"
                
                + "<p>Vui lòng đăng nhập và đổi mật khẩu ngay lập tức tại mục <i>Cài đặt tài khoản</i> để bảo mật.</p>";

        // Gọi hàm build template chung để đóng gói vào khung đẹp
        String finalHtmlBody = buildHtmlTemplate(headerTitle, contentHtml);

        // Gửi đi
        sendEmail(user.getEmail(), subject, finalHtmlBody);
    }

    // --- 4. Gửi OTP đặt lại mật khẩu ---
    public void sendForgotPasswordOtp(String email, String otp) {
        String subject = "OTP đặt lại mật khẩu - LaptopStore";

        String content = "<p>Xin chào,</p>"
                + "<p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản LaptopStore.</p>"
                + "<p>Mã OTP của bạn là:</p>"
                + "<div class='highlight-box'>"
                + "   <span class='highlight-text'>" + otp + "</span>"
                + "</div>"
                + "<p>Mã OTP có hiệu lực trong <b>5 phút</b>.</p>"
                + "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>";

        String htmlBody = buildHtmlTemplate("Đặt lại mật khẩu", content);

        sendEmail(email, subject, htmlBody);
    }

    // --- 5. Gửi OTP Xác thực thay đổi email ---
    public void sendEmailChangeOtp(String newEmail, String otp) {
        String subject = "Xác thực địa chỉ Email Mới";
        
        String content = "<p>Xin chào,</p>"
                + "<p>Hệ thống nhận được yêu cầu thay đổi email sang địa chỉ này.</p>"
                + "<p>Mã xác thực (OTP) của bạn là:</p>"
                + "<div class='highlight-box'>"
                + "   <span class='highlight-text'>" + otp + "</span>"
                + "</div>"
                + "<p>Nếu không phải bạn thực hiện, vui lòng bỏ qua email này.</p>";

        // Tận dụng template HTML đẹp có sẵn của bạn
        String htmlBody = buildHtmlTemplate("Xác thực Email", content);
        sendEmail(newEmail, subject, htmlBody);
    }

    // ========================================================================
    // 1. HÀM DÙNG CHUNG (GỌI CÁI NÀY TỪ CONTROLLER)
    // ========================================================================
    public void sendCommonEmail(String toEmail, String subject, String titleHeader, String contentText) {
        // Bọc nội dung vào template HTML đẹp
        String finalHtmlBody = buildHtmlTemplate(titleHeader, contentText);
        
        // Gửi đi
        sendEmail(toEmail, subject, finalHtmlBody);
    }

    // ========================================================================
    // 2. TEMPLATE HTML (KHUNG GIAO DIỆN)
    // ========================================================================
    private String buildHtmlTemplate(String headerTitle, String bodyContent) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<style>"
                + "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }"
                + ".container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }"
                + ".header { background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center; }"
                + ".header h1 { margin: 0; font-size: 24px; }"
                + ".content { padding: 30px; color: #333333; line-height: 1.6; font-size: 16px; }" // Tăng font-size lên 16px cho dễ đọc
                + ".footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }"
                + ".footer a { color: #007bff; text-decoration: none; }"
                + ".highlight-box { text-align: center; margin: 30px 0; }" // Class dùng chung cho các ô mã số/password
                + ".highlight-text { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #ffffff; background-color: #007bff; padding: 15px 30px; border-radius: 5px; display: inline-block; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='container'>"
                + "  <div class='header'>"
                + "    <h1>Laptop Store</h1>"
                + "    <p style='margin: 5px 0 0; font-size: 14px; opacity: 0.8;'>" + headerTitle + "</p>"
                + "  </div>"
                + "  <div class='content'>"
                +      bodyContent
                + "  </div>"
                + "  <div class='footer'>"
                + "    <p>Đây là email tự động, vui lòng không trả lời email này.</p>"
                + "    <p>Liên hệ hỗ trợ: <a href='mailto:hotro@laptopstore.com'>hotro@laptopstore.com</a></p>"
                + "    <p>&copy; 2025 LaptopStore. All rights reserved.</p>"
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    // ========================================================================
    // 3. HÀM GỬI SMTP (CORE)
    // ========================================================================
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(sender, "LaptopStore Support");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            javaMailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}