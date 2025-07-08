package com.tourify.tourify.service;

import com.tourify.tourify.entity.Session;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Add this import

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional // Add this annotation
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    // Session duration in minutes (for testing)
    private static final int SESSION_DURATION_MINUTES = 60;

    public Session createSession(User user) {
        // Generate a unique token
        String token = UUID.randomUUID().toString();

        // Set expiration time (2 minutes from now for testing)
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(SESSION_DURATION_MINUTES);

        // Create and save session
        Session session = new Session(user, token, expiresAt);
        Session savedSession = sessionRepository.save(session);
        
        System.out.println("🔐 Created session for user: " + user.getUsername() + 
                          " with token: " + token.substring(0, 8) + "..." +
                          " expires at: " + expiresAt);
        
        return savedSession;
    }

    public Optional<User> validateSession(String token) {
        if (token == null || token.trim().isEmpty()) {
            System.out.println("❌ Token is null or empty");
            return Optional.empty();
        }

        System.out.println("🔍 Validating session with token: " + token.substring(0, 8) + "...");
        System.out.println("⏰ Current time: " + LocalDateTime.now());
        
        // First, let's check if the session exists at all
        Optional<Session> anySession = sessionRepository.findByToken(token);
        if (anySession.isPresent()) {
            Session session = anySession.get();
            System.out.println("📋 Session found in database");
            System.out.println("⏰ Session expires at: " + session.getExpiresAt());
            System.out.println("⏰ Is expired? " + session.isExpired());
        } else {
            System.out.println("❌ No session found with this token");
        }
        
        Optional<Session> sessionOpt = sessionRepository.findByTokenAndNotExpired(token, LocalDateTime.now());

        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            System.out.println("✅ Session found and valid");
            System.out.println("⏰ Session expires at: " + session.getExpiresAt());
            
            // Temporarily disable session extension to debug
            // Extend session if it's close to expiring (within 30 seconds for testing)
            // if (session.getExpiresAt().minusSeconds(30).isBefore(LocalDateTime.now())) {
            //     System.out.println("🔄 Extending session...");
            //     extendSession(session);
            // }
            return Optional.of(session.getUser());
        } else {
            System.out.println("❌ Session not found or expired");
            return Optional.empty();
        }
    }

    public void invalidateSession(String token) {
        sessionRepository.findByToken(token).ifPresent(session -> {
            sessionRepository.delete(session);
        });
    }

    public void invalidateAllUserSessions(Long userId) {
        sessionRepository.deleteAllSessionsByUserId(userId);
    }

    protected void extendSession(Session session) {
        session.setExpiresAt(LocalDateTime.now().plusMinutes(SESSION_DURATION_MINUTES));
        sessionRepository.save(session);
    }

    // Clean up expired sessions every 30 seconds (for testing)
    @Scheduled(fixedRate = 30000) // 30 seconds in milliseconds
    @Transactional // Add this annotation
    public void cleanupExpiredSessions() {
        sessionRepository.deleteExpiredSessions(LocalDateTime.now());
    }
}