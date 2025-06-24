package com.tourify.tourify.controller;

import com.tourify.tourify.dto.ErrorResponse;
import com.tourify.tourify.dto.LoginRequest;
import com.tourify.tourify.dto.SignupRequest;
import com.tourify.tourify.dto.AuthResponse;
import com.tourify.tourify.dto.ProfileResponse;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            User user = authService.signup(signupRequest.getUsername(), signupRequest.getPassword(), signupRequest.getEmail());
            // Optionally, return a DTO instead of the entity
            return ResponseEntity.ok(new ProfileResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    new ArrayList<>()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            // Remove "Bearer " prefix if present
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            authService.logout(token);
            return ResponseEntity.ok().body(new ErrorResponse("Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            System.out.println("🌐 Validate endpoint called with token: " + 
                              (token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null"));
            
            // Remove "Bearer " prefix if present
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                System.out.println("🔧 Removed Bearer prefix, token: " + token.substring(0, Math.min(20, token.length())) + "...");
            }
            
            var user = authService.validateToken(token);
            if (user != null) {
                System.out.println("✅ Validation successful for user: " + user.getUsername());
                // Map User to ProfileResponse (blogs as empty list for now)
                ProfileResponse profile = new ProfileResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    new java.util.ArrayList<>()
                );
                return ResponseEntity.ok(profile);
            } else {
                System.out.println("❌ Validation failed - user is null");
                return ResponseEntity.status(401).body(new ErrorResponse("Invalid or expired token"));
            }
        } catch (Exception e) {
            System.out.println("💥 Validation error: " + e.getMessage());
            return ResponseEntity.status(401).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }
}