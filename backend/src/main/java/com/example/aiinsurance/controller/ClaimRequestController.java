package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.ClaimRequestRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/claims/requests")
@CrossOrigin(origins = "http://localhost:5174")
public class ClaimRequestController {

    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository   notificationRepository;
    @Autowired private SubscriptionRepository   subscriptionRepository;
    @Autowired private UserService              userService;
    @Autowired private JwtUtil                  jwtUtil;

    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();

        Optional<Subscription> latestSub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user);
        if (latestSub.isEmpty() || latestSub.get().getStatus() == Subscription.Status.EXPIRED) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active subscription found to file a claim"));
        }

        ClaimRequest req = new ClaimRequest();
        req.setUser(user);
        req.setSubscription(latestSub.get());
        req.setSituation(body.get("situation"));
        req.setDescription(body.get("description"));
        req.setAmount(latestSub.get().getPlan().getCoverageAmount()); // Full coverage amount
        
        claimRequestRepository.save(req);
        return ResponseEntity.ok(Map.of("message", "Claim request submitted successfully", "request", req));
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
        req.setStatus(ClaimRequest.Status.APPROVED);
        claimRequestRepository.save(req);

        // Notify User
        Notification n = new Notification();
        n.setUser(req.getUser());
        n.setTitle("Claim Approved!");
        n.setMessage("Your claim for " + req.getSituation() + " has been approved. You can now claim your ₹" + req.getAmount() + " payout.");
        n.setType("SUCCESS");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Claim request approved"));
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

        // 1. Add to wallet
        user.setWalletBalance(user.getWalletBalance() + req.getAmount());
        userService.updateUser(user);

        // 2. Mark request as claimed
        req.setClaimed(true);
        claimRequestRepository.save(req);

        // 3. Mark Subscription as EXPIRED
        Subscription sub = req.getSubscription();
        sub.setStatus(Subscription.Status.EXPIRED);
        subscriptionRepository.save(sub);

        // Notify User
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle("Payout Successful!");
        n.setMessage("₹" + req.getAmount() + " has been added to your wallet. Your current plan has expired; please purchase a new one for future coverage.");
        n.setType("SUCCESS");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Payout claimed successfully", "newBalance", user.getWalletBalance()));
    }
}
