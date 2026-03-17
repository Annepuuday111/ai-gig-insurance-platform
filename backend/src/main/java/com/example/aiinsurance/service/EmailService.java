package com.example.aiinsurance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            logger.info("Attempting to send OTP email to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("giginsurance2026@gmail.com");
            message.setTo(to);
            message.setSubject("Your Login OTP for Gig Insurance");
            message.setText("Your OTP for logging into Gig Insurance is: " + otp + "\n\nThis OTP is valid for 5 minutes.");
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Error sending email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
