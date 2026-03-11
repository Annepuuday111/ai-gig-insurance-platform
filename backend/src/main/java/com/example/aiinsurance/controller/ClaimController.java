package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5174")
public class ClaimController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimPayment(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing Authorization header"));
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        Optional<Payment> payOpt = paymentRepository.findById(id);
        if (payOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        }
        Payment p = payOpt.get();

        if (!p.getUser().getEmail().equals(username)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (p.getStatus() != Payment.Status.APPROVED) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment is not approved yet"));
        }

        if (p.isClaimed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This payment has already been claimed"));
        }

        User user = p.getUser();
        user.setWalletBalance(user.getWalletBalance() + p.getAmount());
        
        p.setClaimed(true);
        p.setClaimedAt(LocalDateTime.now());
        
        userService.updateUser(user);
        paymentRepository.save(p);

        return ResponseEntity.ok(Map.of(
            "message", "Amount claimed successfully",
            "newBalance", user.getWalletBalance()
        ));
    }
}
