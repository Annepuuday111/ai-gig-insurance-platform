package com.example.aiinsurance.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            logger.info("Attempting to send banner-style OTP email to: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("giginsurance2026@gmail.com");
            helper.setTo(to);
            helper.setSubject("🔒 Your Verification Code - Gig Insurance");

            String htmlContent = buildOtpEmailHtml(otp);
            helper.setText(htmlContent, true);

            // Add embedded banner
            ClassPathResource banner = new ClassPathResource("static/images/banner.png");
            if (banner.exists()) {
                helper.addInline("banner", banner);
            }

            mailSender.send(message);
            logger.info("Banner-style HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Messaging exception while sending email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        } catch (Exception e) {
            logger.error("Error sending email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    private String buildOtpEmailHtml(String otp) {
        String timestamp = java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss")
                .format(java.time.LocalDateTime.now());
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <style>" +
                "        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }"
                +
                "        .wrapper { width: 100%; table-layout: fixed; background-color: #f7f9fc; padding: 40px 0; }" +
                "        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1a202c; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }"
                +
                "        .banner-container { width: 100%; overflow: hidden; }" +
                "        .banner-container img { width: 100%; height: 300px; object-fit: cover; display: block; border-bottom: 4px solid #f0f4f8; }"
                +
                "        .content { padding: 40px 50px; text-align: center; }" +
                "        h1 { color: #2d3748; font-size: 26px; font-weight: 700; margin: 0 0 16px 0; }" +
                "        p { font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 32px 0; }" +
                "        .otp-display { background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 1px dashed #cbd5e0; }"
                +
                "        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #718096; font-weight: 700; margin-bottom: 12px; }"
                +
                "        .otp-code { font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #1a202c; margin: 0; font-family: monospace; }"
                +
                "        .meta-info { font-size: 11px; color: #a0aec0; margin-top: 15px; display: block; }" +
                "        .footer { background-color: #fdfdfe; padding: 30px; text-align: center; border-top: 1px solid #edf2f7; }"
                +
                "        .footer-text { font-size: 12px; color: #a0aec0; line-height: 1.5; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='wrapper'>" +
                "        <table class='main'>" +
                "            <tr>" +
                "                <td class='banner-container'>" +
                "                    <img src='cid:banner' alt='Gig Insurance Banner'>" +
                "                </td>" +
                "            </tr>" +
                "            <tr>" +
                "                <td class='content'>" +
                "                    <h1>Verification Code</h1>" +
                "                    <p>Enter the code below to securely verify your identity for Gig Insurance. For your protection, this code will expire in 5 minutes.</p>"
                +
                "                    <div class='otp-display'>" +
                "                        <div class='otp-label'>Your One-Time Code</div>" +
                "                        <div class='otp-code'>" + otp + "</div>" +
                "                        <span class='meta-info'>Generated at " + timestamp + "</span>" +
                "                    </div>" +
                "                    <p style='font-size: 14px; color: #718096;'>This is an automated security message. If you did not request this, please ignore this email.</p>"
                +
                "                </td>" +
                "            </tr>" +
                "            <tr>" +
                "                <td class='footer'>" +
                "                    <div class='footer-text'>" +
                "                        &copy; 2026 Gig Insurance " +
                "                        Protecting the future of work." +
                "                    </div>" +
                "                </td>" +
                "            </tr>" +
                "        </table>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
