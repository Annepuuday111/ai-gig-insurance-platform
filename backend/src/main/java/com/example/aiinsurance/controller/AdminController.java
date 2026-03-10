package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.Plan;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.service.PlanService;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.service.QueryService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5174")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PlanService planService;

    @Autowired
    private QueryService queryService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ------------ authentication ----------------

    /**
     * allow admin to change their own email/password. requires admin auth
     */
    @PutMapping("/auth/admin/change")
    public ResponseEntity<?> changeCredentials(@RequestHeader("Authorization") String authHeader,
                                               @RequestBody Map<String, String> updates) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token) || !jwtUtil.extractIsAdmin(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }
            String currentEmail = jwtUtil.extractUsername(token);
            Optional<Admin> adminOpt = adminService.findByEmail(currentEmail);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Admin not found"));
            }
            Admin admin = adminOpt.get();
            String newEmail = updates.get("email");
            String newPassword = updates.get("password");
            if (newEmail != null) {
                newEmail = newEmail.toLowerCase();
            }
            if (newEmail != null && !newEmail.equals(currentEmail) && adminService.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "email already taken"));
            }
            Admin saved = adminService.changeCredentials(admin.getId(), newEmail, newPassword);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Credentials updated");
            resp.put("email", saved.getEmail());
            // generate fresh token in case email changed
            String newToken = jwtUtil.generateToken(saved.getEmail(), true);
            resp.put("token", newToken);
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // ------------ user management ----------------
    @GetMapping("/admin/users")
    public List<User> listUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUserById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        if (updates.containsKey("name")) user.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("platform")) user.setPlatform((String) updates.get("platform"));
        if (updates.containsKey("password")) {
            user.setPassword(passwordEncoder.encode((String) updates.get("password")));
        }
        userService.updateUser(user);
        return ResponseEntity.ok(user);
    }

    // ------------ user queries ----------------
    @GetMapping("/admin/queries")
    public List<com.example.aiinsurance.model.Query> listQueries() {
        return queryService.getAll();
    }

    @PutMapping("/admin/queries/{id}/reply")
    public ResponseEntity<?> replyQuery(@PathVariable Long id, @RequestBody Map<String,String> body) {
        Optional<com.example.aiinsurance.model.Query> qOpt = queryService.findById(id);
        if (qOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error","Query not found"));
        }
        com.example.aiinsurance.model.Query q = qOpt.get();
        String answer = body.get("answer");
        if (answer == null || answer.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error","answer required"));
        }
        q.setAnswer(answer);
        q.setAnsweredAt(java.time.LocalDateTime.now());
        queryService.save(q);
        return ResponseEntity.ok(q);
    }

    // ------------ plan management ----------------
    @GetMapping("/admin/plans")
    public List<Plan> listPlans() {
        return planService.getAllPlans();
    }

    @PutMapping("/admin/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id,
                                        @RequestBody Map<String, Object> updates) {
        try {
            Plan plan = planService.getPlanById(id);
            if (updates.containsKey("weeklyPremium")) {
                plan.setWeeklyPremium(Double.valueOf(updates.get("weeklyPremium").toString()));
            }
            if (updates.containsKey("coverageAmount")) {
                plan.setCoverageAmount(Double.valueOf(updates.get("coverageAmount").toString()));
            }
            // apply other fields if needed
            Plan saved = planService.savePlan(plan);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ------------ payment approval ----------------
    @GetMapping("/admin/payments")
    public List<Payment> listPayments() {
        return paymentRepository.findAll();
    }

    @PutMapping("/admin/payments/{id}/approve")
    public ResponseEntity<?> approvePayment(@PathVariable Long id) {
        Optional<Payment> payOpt = paymentRepository.findById(id);
        if (payOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        }
        Payment p = payOpt.get();
        p.setStatus(Payment.Status.SUCCESS);
        paymentRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Payment approved", "payment", p));
    }
}
