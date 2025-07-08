package com.tourify.tourify.service;

import com.tourify.tourify.entity.Session;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @InjectMocks
    private SessionService sessionService;

    private User testUser;
    private Session testSession;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedPassword");
        
        // Create test session
        testSession = new Session();
        testSession.setId(1L);
        testSession.setUser(testUser);
        testSession.setToken("test-token-123");
        testSession.setExpiresAt(LocalDateTime.now().plusHours(1));
    }

    @Test
    void testCreateSession() {
        // Given
        Session savedSession = new Session();
        savedSession.setId(1L);
        savedSession.setUser(testUser);
        savedSession.setToken("generated-token");
        savedSession.setExpiresAt(LocalDateTime.now().plusHours(1));
        
        when(sessionRepository.save(any(Session.class))).thenReturn(savedSession);

        // When
        Session result = sessionService.createSession(testUser);

        // Then
        assertNotNull(result);
        assertEquals(savedSession.getId(), result.getId());
        assertEquals(testUser, result.getUser());
        assertNotNull(result.getToken());
        assertTrue(result.getExpiresAt().isAfter(LocalDateTime.now()));
        
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    void testValidateSessionSuccess() {
        // Given
        String token = "valid-token";
        
        when(sessionRepository.findByTokenAndNotExpired(eq(token), any(LocalDateTime.class)))
                .thenReturn(Optional.of(testSession));

        // When
        Optional<User> result = sessionService.validateSession(token);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
        
        verify(sessionRepository).findByTokenAndNotExpired(eq(token), any(LocalDateTime.class));
    }

    @Test
    void testValidateSessionExpired() {
        // Given
        String token = "expired-token";
        
        when(sessionRepository.findByTokenAndNotExpired(eq(token), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());
        when(sessionRepository.findByToken(token)).thenReturn(Optional.of(testSession));

        // When
        Optional<User> result = sessionService.validateSession(token);

        // Then
        assertFalse(result.isPresent());
        
        verify(sessionRepository).findByTokenAndNotExpired(eq(token), any(LocalDateTime.class));
        verify(sessionRepository).findByToken(token);
    }

    @Test
    void testValidateSessionNotFound() {
        // Given
        String token = "non-existent-token";
        
        when(sessionRepository.findByTokenAndNotExpired(eq(token), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());
        when(sessionRepository.findByToken(token)).thenReturn(Optional.empty());

        // When
        Optional<User> result = sessionService.validateSession(token);

        // Then
        assertFalse(result.isPresent());
        
        verify(sessionRepository).findByTokenAndNotExpired(eq(token), any(LocalDateTime.class));
        verify(sessionRepository).findByToken(token);
    }

    @Test
    void testValidateSessionWithNullToken() {
        // Given
        String token = null;

        // When
        Optional<User> result = sessionService.validateSession(token);

        // Then
        assertFalse(result.isPresent());
        
        verifyNoInteractions(sessionRepository);
    }

    @Test
    void testValidateSessionWithEmptyToken() {
        // Given
        String token = "";

        // When
        Optional<User> result = sessionService.validateSession(token);

        // Then
        assertFalse(result.isPresent());
        
        verifyNoInteractions(sessionRepository);
    }

    @Test
    void testInvalidateSession() {
        // Given
        String token = "token-to-invalidate";
        
        when(sessionRepository.findByToken(token)).thenReturn(Optional.of(testSession));

        // When
        sessionService.invalidateSession(token);

        // Then
        verify(sessionRepository).findByToken(token);
        verify(sessionRepository).delete(testSession);
    }

    @Test
    void testInvalidateSessionNotFound() {
        // Given
        String token = "non-existent-token";
        
        when(sessionRepository.findByToken(token)).thenReturn(Optional.empty());

        // When
        sessionService.invalidateSession(token);

        // Then
        verify(sessionRepository).findByToken(token);
        verify(sessionRepository, never()).delete(any(Session.class));
    }

    @Test
    void testCleanupExpiredSessions() {
        // When
        sessionService.cleanupExpiredSessions();

        // Then
        verify(sessionRepository).deleteExpiredSessions(any(LocalDateTime.class));
    }

    @Test
    void testExtendSession() {
        // Given
        LocalDateTime originalExpiry = testSession.getExpiresAt();
        
        when(sessionRepository.save(testSession)).thenReturn(testSession);

        // When
        sessionService.extendSession(testSession);

        // Then
        assertTrue(testSession.getExpiresAt().isAfter(originalExpiry));
        verify(sessionRepository).save(testSession);
    }
} 