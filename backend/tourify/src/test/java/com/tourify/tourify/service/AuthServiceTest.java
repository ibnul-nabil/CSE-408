package com.tourify.tourify.service;

import com.tourify.tourify.dto.AuthResponse;
import com.tourify.tourify.dto.ProfileResponse;
import com.tourify.tourify.entity.Session;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SessionService sessionService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Session testSession;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        passwordEncoder = new BCryptPasswordEncoder();
        
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        
        // Create test session
        testSession = new Session();
        testSession.setId(1L);
        testSession.setUser(testUser);
        testSession.setToken("test-token-123");
        testSession.setExpiresAt(LocalDateTime.now().plusHours(1));
    }

    @Test
    void testLoginSuccess() {
        // Given
        String username = "testuser";
        String password = "password123";
        
        when(userRepository.findByUsername(username)).thenReturn(testUser);
        when(sessionService.createSession(testUser)).thenReturn(testSession);

        // When
        AuthResponse result = authService.login(username, password);

        // Then
        assertNotNull(result);
        assertNotNull(result.getUser());
        assertEquals(testUser.getId(), result.getUser().getId());
        assertEquals(testUser.getUsername(), result.getUser().getUsername());
        assertEquals(testUser.getEmail(), result.getUser().getEmail());
        assertEquals(testSession.getToken(), result.getToken());
        
        verify(userRepository).findByUsername(username);
        verify(sessionService).createSession(testUser);
    }

    @Test
    void testLoginUserNotFound() {
        // Given
        String username = "nonexistent";
        String password = "password123";
        
        when(userRepository.findByUsername(username)).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(username, password);
        });
        
        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername(username);
        verifyNoInteractions(sessionService);
    }

    @Test
    void testLoginInvalidPassword() {
        // Given
        String username = "testuser";
        String password = "wrongpassword";
        
        when(userRepository.findByUsername(username)).thenReturn(testUser);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(username, password);
        });
        
        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername(username);
        verifyNoInteractions(sessionService);
    }

    @Test
    void testSignupSuccess() {
        // Given
        String username = "newuser";
        String password = "password123";
        String email = "newuser@example.com";
        
        User savedUser = new User();
        savedUser.setId(2L);
        savedUser.setUsername(username);
        savedUser.setEmail(email);
        savedUser.setPassword(passwordEncoder.encode(password));
        
        when(userRepository.findByUsername(username)).thenReturn(null);
        when(userRepository.findByEmail(email)).thenReturn(null);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        User result = authService.signup(username, password, email);

        // Then
        assertNotNull(result);
        assertEquals(savedUser.getId(), result.getId());
        assertEquals(username, result.getUsername());
        assertEquals(email, result.getEmail());
        
        verify(userRepository).findByUsername(username);
        verify(userRepository).findByEmail(email);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testSignupUsernameExists() {
        // Given
        String username = "existinguser";
        String password = "password123";
        String email = "new@example.com";
        
        when(userRepository.findByUsername(username)).thenReturn(testUser);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.signup(username, password, email);
        });
        
        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository).findByUsername(username);
        verify(userRepository, never()).findByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testSignupEmailExists() {
        // Given
        String username = "newuser";
        String password = "password123";
        String email = "existing@example.com";
        
        when(userRepository.findByUsername(username)).thenReturn(null);
        when(userRepository.findByEmail(email)).thenReturn(testUser);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.signup(username, password, email);
        });
        
        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository).findByUsername(username);
        verify(userRepository).findByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogout() {
        // Given
        String token = "test-token-123";

        // When
        authService.logout(token);

        // Then
        verify(sessionService).invalidateSession(token);
    }

    @Test
    void testValidateTokenSuccess() {
        // Given
        String token = "test-token-123";
        
        when(sessionService.validateSession(token)).thenReturn(Optional.of(testUser));

        // When
        User result = authService.validateToken(token);

        // Then
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getUsername(), result.getUsername());
        
        verify(sessionService).validateSession(token);
    }

    @Test
    void testValidateTokenInvalid() {
        // Given
        String token = "invalid-token";
        
        when(sessionService.validateSession(token)).thenReturn(Optional.empty());

        // When
        User result = authService.validateToken(token);

        // Then
        assertNull(result);
        verify(sessionService).validateSession(token);
    }
} 