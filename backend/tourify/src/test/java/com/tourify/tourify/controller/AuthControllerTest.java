package com.tourify.tourify.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tourify.tourify.dto.AuthResponse;
import com.tourify.tourify.dto.LoginRequest;
import com.tourify.tourify.dto.ProfileResponse;
import com.tourify.tourify.dto.SignupRequest;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    
    private User testUser;
    private ProfileResponse testProfile;
    private AuthResponse testAuthResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
        
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedPassword");
        
        // Create test profile
        testProfile = new ProfileResponse(1L, "testuser", "test@example.com", new ArrayList<>());
        
        // Create test auth response
        testAuthResponse = new AuthResponse(testProfile, "test-token-123");
    }

    @Test
    void testLoginSuccess() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
        
        when(authService.login("testuser", "password123")).thenReturn(testAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(1))
                .andExpect(jsonPath("$.user.username").value("testuser"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.token").value("test-token-123"));

        verify(authService).login("testuser", "password123");
    }

    @Test
    void testLoginFailure() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("wrongpassword");
        
        when(authService.login("testuser", "wrongpassword"))
                .thenThrow(new RuntimeException("Invalid username or password"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));

        verify(authService).login("testuser", "wrongpassword");
    }

    @Test
    void testSignupSuccess() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setPassword("password123");
        signupRequest.setEmail("newuser@example.com");
        
        User newUser = new User();
        newUser.setId(2L);
        newUser.setUsername("newuser");
        newUser.setEmail("newuser@example.com");
        
        when(authService.signup("newuser", "password123", "newuser@example.com"))
                .thenReturn(newUser);

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.email").value("newuser@example.com"));

        verify(authService).signup("newuser", "password123", "newuser@example.com");
    }

    @Test
    void testSignupFailureUsernameExists() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("existinguser");
        signupRequest.setPassword("password123");
        signupRequest.setEmail("existing@example.com");
        
        when(authService.signup("existinguser", "password123", "existing@example.com"))
                .thenThrow(new RuntimeException("Username already exists"));

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Username already exists"));

        verify(authService).signup("existinguser", "password123", "existing@example.com");
    }

    @Test
    void testLogoutSuccess() throws Exception {
        // Given
        String token = "Bearer test-token-123";
        
        doNothing().when(authService).logout("test-token-123");

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        verify(authService).logout("test-token-123");
    }

    @Test
    void testLogoutWithoutBearerPrefix() throws Exception {
        // Given
        String token = "test-token-123";
        
        doNothing().when(authService).logout("test-token-123");

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        verify(authService).logout("test-token-123");
    }

    @Test
    void testLogoutFailure() throws Exception {
        // Given
        String token = "Bearer invalid-token";
        
        doThrow(new RuntimeException("Invalid token")).when(authService).logout("invalid-token");

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid token"));

        verify(authService).logout("invalid-token");
    }

    @Test
    void testValidateTokenSuccess() throws Exception {
        // Given
        String token = "Bearer test-token-123";
        
        when(authService.validateToken("test-token-123")).thenReturn(testUser);

        // When & Then
        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(authService).validateToken("test-token-123");
    }

    @Test
    void testValidateTokenInvalid() throws Exception {
        // Given
        String token = "Bearer invalid-token";
        
        when(authService.validateToken("invalid-token")).thenReturn(null);

        // When & Then
        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid or expired token"));

        verify(authService).validateToken("invalid-token");
    }

    @Test
    void testValidateTokenException() throws Exception {
        // Given
        String token = "Bearer test-token-123";
        
        when(authService.validateToken("test-token-123"))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Database error"));

        verify(authService).validateToken("test-token-123");
    }

    @Test
    void testHealthCheck() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }

    @Test
    void testLoginWithMissingFields() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        // Missing password

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password is required"));

        // Service should not be called when validation fails
        verifyNoInteractions(authService);
    }

    @Test
    void testSignupWithMissingFields() throws Exception {
        // Given
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        // Missing password and email

        // When & Then
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password is required"));

        // Service should not be called when validation fails
        verifyNoInteractions(authService);
    }
} 