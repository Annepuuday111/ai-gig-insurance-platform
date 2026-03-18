package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.service.EmailService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final Map<String, String> registrationOtps = new ConcurrentHashMap<>();

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    // needed for encoding a new password during profile updates
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/register-init")
    public ResponseEntity<?> registerInit(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            email = email.toLowerCase().trim();

            if (userService.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }
            if (request.containsKey("phone") && userService.existsByPhone(request.get("phone"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number already exists"));
            }

            String otp = emailService.generateOtp();
            registrationOtps.put(email, otp);

            System.out.println("\n---------------------------------------------------------");
            System.out.println("REGISTRATION OTP GENERATED FOR " + email + ": " + otp);
            System.out.println("---------------------------------------------------------\n");

            try {
                emailService.sendOtpEmail(email, otp);
            } catch (Exception e) {
                System.err.println("Warning: Failed to send REGISTRATION OTP email: " + e.getMessage());
                System.err.println("The system will continue using the console-logged OTP.");
            }

            return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email").toLowerCase().trim();
            String phone = request.get("phone");
            String password = request.get("password");
            String platform = request.get("platform");
            String otp = request.get("otp");

            String storedOtp = registrationOtps.get(email);
            if (storedOtp == null || !storedOtp.equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
            }

            User user = new User(name, email, phone, password, platform);
            User savedUser = userService.registerUser(user);
            registrationOtps.remove(email);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully. Please login with your registered email: " + savedUser.getEmail());
            response.put("email", savedUser.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String identifier = request.get("identifier");
            String password = request.get("password");

            // if identifier belongs to an admin, authenticate strictly as admin
            if (identifier != null) {
                String normalized = identifier.toLowerCase();
                Optional<com.example.aiinsurance.model.Admin> adminOpt = adminService.findByEmail(normalized);
                if (adminOpt.isPresent()) {
                    if (!adminService.authenticate(normalized, password)) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
                    }
                    String token = jwtUtil.generateToken(normalized, true);
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("isAdmin", true);
                    response.put("email", normalized);
                    return ResponseEntity.ok(response);
                }
                // if email not found, try legacy username migration (local-part)
                if (normalized.contains("@")) {
                    String local = normalized.split("@", 2)[0];
                    Optional<com.example.aiinsurance.model.Admin> legacyOpt = adminService.findByEmail(local);
                    if (legacyOpt.isPresent()) {
                        // check password against legacy record
                        if (adminService.authenticate(local, password)) {
                            // update the admin record to new email
                            Admin updated = adminService.changeCredentials(legacyOpt.get().getId(), normalized, null);
                            String token = jwtUtil.generateToken(normalized, true);
                            Map<String, Object> response = new HashMap<>();
                            response.put("token", token);
                            response.put("isAdmin", true);
                            response.put("email", normalized);
                            return ResponseEntity.ok(response);
                        } else {
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
                        }
                    }
                }
            }

            String normalizedId = identifier != null ? identifier.toLowerCase().trim() : "";
            Optional<User> userOpt = userService.findByEmail(normalizedId);
            if (userOpt.isEmpty()) {
                userOpt = userService.findByPhone(normalizedId);
            }

            if (userOpt.isEmpty() || !userService.validatePassword(password, userOpt.get().getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }

            User user = userOpt.get();
            
            // Generate and send OTP
            String otp = emailService.generateOtp();
            user.setOtp(otp);
            user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
            userService.updateUser(user);

            // Print OTP to console for local testing purposes in case email configuration (like App Password) is missing
            System.out.println("\n---------------------------------------------------------");
            System.out.println("OTP GENERATED FOR " + user.getEmail() + ": " + otp);
            System.out.println("---------------------------------------------------------\n");

            try {
                emailService.sendOtpEmail(user.getEmail(), otp);
            } catch (Exception e) {
                System.err.println("Warning: Failed to send OTP email: " + e.getMessage());
                System.err.println("The system will continue using the console-logged OTP.");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent to your registered email");
            response.put("requiresOtp", true);
            response.put("email", user.getEmail()); // return email for verification step
            response.put("phone", user.getPhone());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/social")
    public ResponseEntity<?> socialLogin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required from social provider"));
            }

            email = email.toLowerCase().trim();

            Optional<com.example.aiinsurance.model.Admin> adminOpt = adminService.findByEmail(email);
            if (adminOpt.isPresent()) {
                String token = jwtUtil.generateToken(email, true);
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("isAdmin", true);
                response.put("email", email);
                return ResponseEntity.ok(response);
            }

            Optional<User> userOpt = userService.findByEmail(email);
            User user;
            if (userOpt.isEmpty()) {
                user = new User(
                        name != null && !name.trim().isEmpty() ? name : email.split("@")[0],
                        email,
                        "SOCIAL_" + email.hashCode(), // unique placeholder — no phone from social login
                        passwordEncoder.encode(java.util.UUID.randomUUID().toString()),
                        "WEB"
                );
                user = userService.registerUser(user);
            } else {
                user = userOpt.get();
            }

            String token = jwtUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("isAdmin", false);
            response.put("walletBalance", user.getWalletBalance());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String identifier = request.get("identifier");
            String otp = request.get("otp");

            Optional<User> userOpt = userService.findByEmail(identifier);
            if (userOpt.isEmpty()) {
                userOpt = userService.findByPhone(identifier);
            }

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getOtp() == null || !user.getOtp().equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
            }

            if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
            }

            // Clear OTP after successful verification
            user.setOtp(null);
            user.setOtpExpiry(null);
            userService.updateUser(user);

            String token = jwtUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("isAdmin", false);
            response.put("walletBalance", user.getWalletBalance());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("platform", user.getPlatform());
            response.put("state", user.getState());
            response.put("district", user.getDistrict());
            response.put("mandal", user.getMandal());
            response.put("walletBalance", user.getWalletBalance());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Map<String, String> updates) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            // update allowed fields if present in request
            if (updates.containsKey("name")) {
                user.setName(updates.get("name"));
            }
            if (updates.containsKey("phone")) {
                String newPhone = updates.get("phone");
                if (!newPhone.equals(user.getPhone()) && userService.existsByPhone(newPhone)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Phone number already in use"));
                }
                user.setPhone(newPhone);
            }
            if (updates.containsKey("platform")) {
                user.setPlatform(updates.get("platform"));
            }
            if (updates.containsKey("password")) {
                // encode new password
                user.setPassword(passwordEncoder.encode(updates.get("password")));
            }
            if (updates.containsKey("state")) {
                String val = updates.get("state");
                if (val != null && !val.trim().isEmpty() && (user.getState() == null || user.getState().trim().isEmpty())) {
                    user.setState(val);
                }
            }
            if (updates.containsKey("district")) {
                String val = updates.get("district");
                if (val != null && !val.trim().isEmpty() && (user.getDistrict() == null || user.getDistrict().trim().isEmpty())) {
                    user.setDistrict(val);
                }
            }
            if (updates.containsKey("mandal")) {
                String val = updates.get("mandal");
                if (val != null && !val.trim().isEmpty() && (user.getMandal() == null || user.getMandal().trim().isEmpty())) {
                    user.setMandal(val);
                }
            }

            User updated = userService.updateUser(user);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Profile updated successfully");
            res.put("id", updated.getId());
            res.put("name", updated.getName());
            res.put("email", updated.getEmail());
            res.put("phone", updated.getPhone());
            res.put("platform", updated.getPlatform());
            res.put("state", updated.getState());
            res.put("district", updated.getDistrict());
            res.put("mandal", updated.getMandal());
            res.put("walletBalance", updated.getWalletBalance());
            res.put("createdAt", updated.getCreatedAt() != null ? updated.getCreatedAt().toString() : null);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}