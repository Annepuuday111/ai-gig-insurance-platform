package com.example.aiinsurance.service;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AutoClaimService — Runs every hour to:
 * 1. Expire subscriptions that are older than 7 days (and notify user)
 * 2. Check for AI parametric disaster triggers in the user's location
 * 3. Auto-file a claim request on behalf of the user if a disaster is detected
 * 4. Skip users who already have a claim this week
 */
@Service
public class AutoClaimService {

    @Autowired private AIService aiService;
    @Autowired private ClaimService claimService;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository notificationRepository;

    /**
     * Run every hour (3,600,000 ms). Monitors all ACTIVE subscriptions.
     */
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void monitorAndFileClaims() {
        System.out.println("[AutoClaimService] Running disaster monitoring at " + LocalDateTime.now());

        List<Subscription> activeSubs = subscriptionRepository.findByStatus(Subscription.Status.ACTIVE);
        System.out.println("[AutoClaimService] Found " + activeSubs.size() + " active subscriptions.");

        for (Subscription sub : activeSubs) {
            User user = sub.getUser();

            // ── 1. Auto-expire plans older than 7 days ──────────────────────────
            if (sub.getStartDate() != null && sub.getStartDate().plusDays(7).isBefore(LocalDateTime.now())) {
                sub.setStatus(Subscription.Status.EXPIRED);
                sub.setEndDate(LocalDateTime.now());
                subscriptionRepository.save(sub);

                // Admin keeps the premium — no refund needed. Just notify user.
                sendNotification(user,
                        "📅 Your " + sub.getPlan().getName() + " Plan Expired",
                        "Your weekly " + sub.getPlan().getName() + " plan has expired. " +
                        "No disaster occurred this week — your premium of ₹" + sub.getPlan().getWeeklyPremium() +
                        " remains in the insurance fund. Purchase a new plan to stay protected next week.",
                        "INFO");
                continue;
            }

            // ── 2. Skip if user already has a claim this week ─────────────────
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
            boolean alreadyClaimed = claimRequestRepository.findByUser(user).stream()
                    .anyMatch(r -> r.getCreatedAt().isAfter(oneWeekAgo));

            if (alreadyClaimed) {
                System.out.println("[AutoClaimService] User " + user.getEmail() + " already has a claim this week. Skipping.");
                continue;
            }

            // ── 3. Skip users with no location set ────────────────────────────
            if (user.getState() == null || user.getState().isBlank()) {
                System.out.println("[AutoClaimService] User " + user.getEmail() + " has no location set. Skipping.");
                continue;
            }

            // ── 4. AI Parametric Trigger Check ────────────────────────────────
            try {
                Map<String, Object> aiResult = aiService.checkParametric(
                        user.getId(),
                        user.getState(),
                        user.getDistrict() != null ? user.getDistrict() : user.getState(),
                        sub.getPlan().getName(),
                        sub.getPlan().getCoverageAmount()
                );

                if (aiResult == null) continue;

                boolean triggerMet = Boolean.TRUE.equals(aiResult.get("trigger_met"));

                if (triggerMet) {
                    // Extract disaster type from AI response
                    String disasterType = "Natural Disaster";
                    String weatherDetails = "";

                    Object detailsObj = aiResult.get("details");
                    if (detailsObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> details = (Map<String, Object>) detailsObj;
                        if (details.containsKey("condition"))
                            disasterType = details.get("condition").toString();
                        if (details.containsKey("description"))
                            weatherDetails = " — " + details.get("description").toString();
                    }

                    // Also check parametric_check field if present
                    Object paramCheck = aiResult.get("parametric_check");
                    if (paramCheck instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> pc = (Map<String, Object>) paramCheck;
                        Object severity = pc.get("severity");
                        if (severity != null) weatherDetails += " [Severity: " + severity + "]";
                    }

                    System.out.println("[AutoClaimService] ⚠️ Disaster detected for " + user.getEmail()
                            + " in " + user.getDistrict() + ", " + user.getState()
                            + " — Type: " + disasterType);

                    // Auto-file claim
                    ClaimRequest req = new ClaimRequest();
                    req.setUser(user);
                    req.setSubscription(sub);
                    req.setSituation("AI-AUTO: " + disasterType.toUpperCase());
                    req.setDescription(
                            "🤖 AI Auto-Filed Claim — Parametric trigger detected.\n" +
                            "Location: " + (user.getMandal() != null ? user.getMandal() + ", " : "") +
                            user.getDistrict() + ", " + user.getState() + "\n" +
                            "Disaster: " + disasterType + weatherDetails + "\n" +
                            "Plan: " + sub.getPlan().getName() + " (₹" + sub.getPlan().getWeeklyPremium() + "/week)\n" +
                            "Coverage: ₹" + sub.getPlan().getCoverageAmount() + "\n" +
                            "[AI ANALYTICS]: Parametric insurance trigger threshold exceeded."
                    );
                    req.setAmount(sub.getPlan().getCoverageAmount());
                    req.setStatus(ClaimRequest.Status.PENDING);
                    req.setCreatedAt(LocalDateTime.now());
                    claimRequestRepository.save(req);

                    // ── 🛡️ AUTO-APPROVE CHECK ──
                    String triggerResult = claimService.evaluateTriggers(req, user);
                    if ("APPROVE".equals(triggerResult)) {
                        claimService.approveRequestInternal(req);
                        System.out.println("[AutoClaimService] ✅ Claim for " + user.getEmail() + " auto-approved based on plan triggers.");
                    } else {
                        // Notify user
                        sendNotification(user,
                                "⚠️ Disaster Detected — AI Auto-Filed Claim",
                                "A " + disasterType + " has been detected in your area (" + user.getDistrict() + ", " + user.getState() + "). " +
                                "Our AI has automatically filed a claim of ₹" + req.getAmount() + " on your behalf. " +
                                "Awaiting final verification. You will be notified once approved.",
                                "WARNING");

                        // Notify admin
                        notifyAdmin("🆕 New AI Claim — " + disasterType,
                                "AI detected " + disasterType + " in " + user.getDistrict() + ", " + user.getState() +
                                ". Claim of ₹" + req.getAmount() + " auto-filed for user " + user.getName() + " (" + user.getEmail() + "). " +
                                "Review and approve in the Disaster Claims section.");
                    }

                } else {
                    System.out.println("[AutoClaimService] No trigger for user " + user.getEmail()
                            + " in " + user.getState());
                }

            } catch (Exception e) {
                System.err.println("[AutoClaimService] Error checking user " + user.getId() + ": " + e.getMessage());
            }
        }

        System.out.println("[AutoClaimService] Monitoring cycle complete.");
    }

    private void sendNotification(User user, String title, String message, String type) {
        try {
            Notification n = new Notification();
            n.setUser(user);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("[AutoClaimService] Failed to save notification: " + e.getMessage());
        }
    }

    private void notifyAdmin(String title, String message) {
        // Admin notifications logged to server console — can be extended to a separate admin notification table
        System.out.println("[ADMIN ALERT] " + title + " — " + message);
    }
}
