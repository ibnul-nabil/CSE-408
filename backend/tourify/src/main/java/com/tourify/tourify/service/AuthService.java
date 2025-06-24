package com.tourify.tourify.service;

import com.tourify.tourify.dto.ProfileResponse;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.entity.Session;
import com.tourify.tourify.repository.UserRepository;
import com.tourify.tourify.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionService sessionService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        ProfileResponse profile = new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                new ArrayList<>()
        );

        // Create a new session
        Session session = sessionService.createSession(user);
        
        return new AuthResponse(profile, session.getToken());
    }

    public User signup(String username, String password, String email) {
        // Check if username already exists
        if (userRepository.findByUsername(username) != null) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(user);
        
        return savedUser;
    }

    public void logout(String token) {
        sessionService.invalidateSession(token);
    }

    public User validateToken(String token) {
        return sessionService.validateSession(token).orElse(null);
    }
}