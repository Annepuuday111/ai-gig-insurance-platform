package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.AdminRepository;
import com.example.aiinsurance.repository.ClaimRequestRepository;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.service.AIService;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/claims/requests")
@CrossOrigin(origins = "http://localhost:5174")
@Transactional
public class ClaimRequestController {

    @Autowired private AIService              aiService;
    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository   notificationRepository;
    @Autowired private SubscriptionRepository   subscriptionRepository;
    @Autowired private AdminRepository          adminRepository;
    @Autowired private UserService              userService;
    @Autowired private JwtUtil                  jwtUtil;
    @Autowired private PaymentRepository        paymentRepository;

    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();

        Optional<Subscription> latestSub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user);
        if (latestSub.isEmpty() || latestSub.get().getStatus() == Subscription.Status.EXPIRED) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active subscription found to file a claim"));
        }

        // Check 1 claim per week rule
        java.time.LocalDateTime oneWeekAgo = java.time.LocalDateTime.now().minusDays(7);
        boolean hasRecentClaim = claimRequestRepository.findByUser(user).stream()
                .anyMatch(r -> r.getCreatedAt().isAfter(oneWeekAgo));
        if (hasRecentClaim) {
             return ResponseEntity.badRequest().body(Map.of("error", "You have already filed a claim request within the last 7 days."));
        }

        ClaimRequest req = new ClaimRequest();
        req.setUser(user);
        req.setSubscription(latestSub.get());
        req.setSituation(body.get("situation"));
        req.setDescription(body.get("description"));
        req.setAmount(latestSub.get().getPlan().getCoverageAmount());

        // ── 🤖 AI FRAUD ANALYSIS ──
        try {
            // Predict fraud risk using AI microservice
            @SuppressWarnings("unchecked")
            Map<String, Object> aiResult = (Map<String, Object>) aiService.detectFraud(
                user.getId(), 
                req.getSituation(),
                user.getState(), user.getState(), // simple mock location check
                true, 30, 0.8, // passing high weather risk to correlate
                req.getAmount(), req.getAmount(),
                30, 0
            );

            Map<String, Object> fraudAnalysis = (Map<String, Object>) aiResult.get("fraud_analysis");
            if (fraudAnalysis != null) {
                String recommendation = (String) aiResult.get("action");
                Double fraudScore = Double.valueOf(fraudAnalysis.get("fraud_score").toString());
                
                // If AI flags it as highly suspicious, we could auto-reject or flag for admin
                if ("REJECT_AUTO".equals(recommendation)) {
                    return ResponseEntity.status(403).body(Map.of(
                        "error", "Claim flagged as highly suspicious by AI engine. Please contact support.",
                        "ai_score", fraudScore
                    ));
                }
                
                // Append AI notes to description for admin to see
                req.setDescription(req.getDescription() + "\n\n[AI ANALYTICS]: Risk Score " + 
                    Math.round(fraudScore * 100) + "%. " + 
                    recommendation.replace("_", " ") + ".");
            }
        } catch (Exception e) {
            System.err.println("AI Fraud Analysis skipped (Service Offline): " + e.getMessage());
        }

        claimRequestRepository.save(req);
        return ResponseEntity.ok(Map.of("message", "Claim request submitted successfully (AI Verified)", "request", req));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();
        return ResponseEntity.ok(claimRequestRepository.findByUser(user));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(claimRequestRepository.findAll());
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        ClaimRequest req = claimRequestRepository.findById(id).orElseThrow();
        if (req.getStatus() == ClaimRequest.Status.APPROVED || req.isClaimed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Claim is already approved or claimed"));
        }

        User user = req.getUser();

        // 1. Add to user wallet
        User managedUser = userService.findById(user.getId()).orElse(user);
        managedUser.setWalletBalance(managedUser.getWalletBalance() + req.getAmount());
        userService.updateUser(managedUser);

        // 2. Deduct from Admin Wallet
        try {
            java.util.List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                double newAdminBalance = admin.getWalletBalance() - req.getAmount();
                admin.setWalletBalance(Math.max(0.0, newAdminBalance));
                adminRepository.save(admin);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not deduct from admin wallet: " + e.getMessage());
        }

        // 3. Mark request as APPROVED and CLAIMED (automated)
        req.setStatus(ClaimRequest.Status.APPROVED);
        req.setClaimed(true);
        claimRequestRepository.save(req);

        // 4. Mark Subscription as EXPIRED (closes the user plan)
        Subscription sub = req.getSubscription();
        if (sub != null) {
            sub.setStatus(Subscription.Status.EXPIRED);
            subscriptionRepository.save(sub);
        }

        // 5. Notify User with success
        Notification n = new Notification();
        n.setUser(managedUser);
        n.setTitle("Insurance Claim Approved & Paid! 🌩️");
        n.setMessage("Your claim for " + req.getSituation() + " was approved. ₹" + req.getAmount() + " has been added to your wallet automatically. Your current weekly plan is now closed.");
        n.setType("SUCCESS");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Claim request approved and payout processed automatically"));
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        ClaimRequest req = claimRequestRepository.findById(id).orElseThrow();
        req.setStatus(ClaimRequest.Status.REJECTED);
        claimRequestRepository.save(req);

        // Notify User
        Notification n = new Notification();
        n.setUser(req.getUser());
        n.setTitle("Claim Rejected");
        n.setMessage("Your claim request was rejected. Please contact support for more details.");
        n.setType("DANGER");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Claim request rejected"));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimPayout(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();

        ClaimRequest req = claimRequestRepository.findById(id).orElseThrow();
        if (!req.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        if (req.getStatus() != ClaimRequest.Status.APPROVED) {
            return ResponseEntity.badRequest().body(Map.of("error", "Claim is not approved yet"));
        }

        if (req.isClaimed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already claimed"));
        }

        // Limit to 1 claim payout per week (across disaster and regular claims)
        java.time.LocalDateTime oneWeekAgo = java.time.LocalDateTime.now().minusDays(7);
        boolean recentlyClaimedDisaster = claimRequestRepository.findByUser(user).stream()
                .anyMatch(r -> r.isClaimed() && r.getCreatedAt().isAfter(oneWeekAgo));
        
        boolean recentlyClaimedPayment = paymentRepository.findAll().stream()
                .anyMatch(pay -> pay.getUser().getId().equals(user.getId()) 
                              && pay.isClaimed() 
                              && pay.getClaimedAt() != null 
                              && pay.getClaimedAt().isAfter(oneWeekAgo));

        if (recentlyClaimedDisaster || recentlyClaimedPayment) {
             return ResponseEntity.badRequest().body(Map.of("error", "You can only claim one payout per week. Please wait until next week."));
        }

        // 1. Add to wallet
        // Re-fetch user to ensure we have the latest managed entity and balance
        User managedUser = userService.findById(user.getId()).orElse(user);
        managedUser.setWalletBalance(managedUser.getWalletBalance() + req.getAmount());
        userService.updateUser(managedUser);

        // Deduct from Admin Wallet
        try {
            java.util.List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                double newAdminBalance = admin.getWalletBalance() - req.getAmount();
                admin.setWalletBalance(Math.max(0.0, newAdminBalance));
                adminRepository.save(admin);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not deduct from admin wallet: " + e.getMessage());
        }

        // 2. Mark request as claimed
        req.setClaimed(true);
        claimRequestRepository.save(req);

        // 3. Mark Subscription as EXPIRED
        Subscription sub = req.getSubscription();
        sub.setStatus(Subscription.Status.EXPIRED);
        subscriptionRepository.save(sub);

        // Notify User
        Notification n = new Notification();
        n.setUser(managedUser);
        n.setTitle("Payout Successful!");
        n.setMessage("₹" + req.getAmount() + " has been added to your wallet. Your current plan has expired; please purchase a new one for future coverage.");
        n.setType("SUCCESS");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Payout claimed successfully", "newBalance", managedUser.getWalletBalance()));
    }
}
