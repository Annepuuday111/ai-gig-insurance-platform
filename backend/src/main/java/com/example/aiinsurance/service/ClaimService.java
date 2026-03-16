package com.example.aiinsurance.service;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ClaimService {

    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private UserService userService;
    @Autowired private AIService aiService;

    public String evaluateTriggers(ClaimRequest req, User user) {
        try {
            String json = req.getSubscription().getPlan().getParametricTriggers();
            if (json == null || json.isBlank() || "[]".equals(json)) return "PENDING";

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> triggers = mapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
            
            // Filter triggers for this situation or AI-AUTO situations
            List<Map<String, Object>> matchingTriggers = triggers.stream()
                .filter(t -> {
                    String sit = (String)t.get("situation");
                    return req.getSituation().equalsIgnoreCase(sit) || req.getSituation().toUpperCase().contains(sit.toUpperCase());
                })
                .toList();
            
            if (matchingTriggers.isEmpty()) return "PENDING";

            Map<String, Object> weather = aiService.getWeather(user.getState(), user.getDistrict());
            if (weather.containsKey("error")) return "PENDING";

            boolean anyMatch = false;
            for (Map<String, Object> t : matchingTriggers) {
                String factor = (String) t.get("factor");
                String operator = (String) t.get("operator");
                double threshold = Double.parseDouble(t.get("threshold").toString());
                
                Double actualValue = null;
                if ("temperature".equalsIgnoreCase(factor)) actualValue = Double.valueOf(weather.get("temp").toString());
                else if ("wind_speed".equalsIgnoreCase(factor)) actualValue = Double.valueOf(weather.get("wind_speed").toString());
                else if ("rainfall".equalsIgnoreCase(factor)) actualValue = Double.valueOf(weather.get("rainfall").toString());
                else if ("humidity".equalsIgnoreCase(factor)) actualValue = Double.valueOf(weather.get("humidity").toString());

                if (actualValue != null) {
                    if (">".equals(operator) && actualValue > threshold) anyMatch = true;
                    else if ("<".equals(operator) && actualValue < threshold) anyMatch = true;
                    else if ("==".equals(operator) && actualValue == threshold) anyMatch = true;
                    else if (">=".equals(operator) && actualValue >= threshold) anyMatch = true;
                    else if ("<=".equals(operator) && actualValue <= threshold) anyMatch = true;
                }
            }

            return anyMatch ? "APPROVE" : "REJECT";
        } catch (Exception e) {
            System.err.println("Trigger evaluation failed: " + e.getMessage());
            return "PENDING";
        }
    }

    public void approveRequestInternal(ClaimRequest req) {
        if (req.getStatus() == ClaimRequest.Status.APPROVED) return;
        
        User user = req.getUser();
        User managedUser = userService.findById(user.getId()).orElse(user);
        managedUser.setWalletBalance(managedUser.getWalletBalance() + req.getAmount());
        userService.updateUser(managedUser);

        try {
            List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                admin.setWalletBalance(Math.max(0.0, admin.getWalletBalance() - req.getAmount()));
                adminRepository.save(admin);
            }
        } catch (Exception ignored) {}

        req.setStatus(ClaimRequest.Status.APPROVED);
        req.setClaimed(true);
        claimRequestRepository.save(req);

        Subscription sub = req.getSubscription();
        if (sub != null) {
            sub.setStatus(Subscription.Status.EXPIRED);
            subscriptionRepository.save(sub);
        }

        Notification n = new Notification();
        n.setUser(managedUser);
        n.setTitle("Insurance Claim Approved! 🌩️");
        n.setMessage("Your claim for " + req.getSituation() + " was approved and ₹" + req.getAmount() + " was added to your wallet automatically.");
        n.setType("SUCCESS");
        notificationRepository.save(n);
    }

    public void rejectRequestInternal(ClaimRequest req, String reason) {
        req.setStatus(ClaimRequest.Status.REJECTED);
        claimRequestRepository.save(req);
        Notification n = new Notification();
        n.setUser(req.getUser());
        n.setTitle("Claim Rejected");
        n.setMessage(reason);
        n.setType("DANGER");
        notificationRepository.save(n);
    }
}
