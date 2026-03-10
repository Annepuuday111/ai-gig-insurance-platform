package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.User;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5174")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // needed for encoding a new password during profile updates
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String phone = request.get("phone");
            String password = request.get("password");
            String platform = request.get("platform");

            User user = new User(name, email, phone, password, platform);
            User savedUser = userService.registerUser(user);

            // generate token same as login
            String token = jwtUtil.generateToken(savedUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("token", token);
            response.put("id", savedUser.getId());
            response.put("name", savedUser.getName());
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

            Optional<User> userOpt = userService.findByEmail(identifier);
            if (userOpt.isEmpty()) {
                userOpt = userService.findByPhone(identifier);
            }

            if (userOpt.isEmpty() || !userService.validatePassword(password, userOpt.get().getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }

            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("name", user.getName());

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

            User updated = userService.updateUser(user);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Profile updated successfully");
            res.put("id", updated.getId());
            res.put("name", updated.getName());
            res.put("email", updated.getEmail());
            res.put("phone", updated.getPhone());
            res.put("platform", updated.getPlatform());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}