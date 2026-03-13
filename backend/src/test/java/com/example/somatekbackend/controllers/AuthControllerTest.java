package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.LoginRequest;
import com.example.somatekbackend.dto.LoginResponse;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.service.IOAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private IOAuthService oAuthService;

    @InjectMocks
    private AuthController authController;

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("test@example.com");
        request.setPassword("password");

        UUID userId = UUID.randomUUID();
        LoginResponse loginResponse = new LoginResponse(
                "jwt-token", "Bearer", userId,
                "test@example.com", "test@example.com",
                "John", "Doe", "STUDENT"
        );

        when(oAuthService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        ResponseObjectDto result = authController.login(request);

        assertTrue(result.getStatus());
        assertNotNull(result.getData());
    }

    @Test
    void login_failure_returnsError() {
        LoginRequest request = new LoginRequest();
        request.setUsername("bad@example.com");
        request.setPassword("wrong");

        when(oAuthService.login(any(LoginRequest.class))).thenThrow(new RuntimeException("Invalid credentials"));

        ResponseObjectDto result = authController.login(request);

        assertFalse(result.getStatus());
        assertEquals("Invalid credentials", result.getMessage());
    }

    @Test
    void signup_success() {
        UserDto userDto = new UserDto();
        userDto.setEmail("new@example.com");
        userDto.setPassword("password");
        userDto.setFirstName("New");
        userDto.setLastName("User");
        userDto.setRole("STUDENT");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("new@example.com");

        when(oAuthService.signup(any(UserDto.class))).thenReturn(user);

        ResponseObjectDto result = authController.signup(userDto);

        assertTrue(result.getStatus());
    }

    @Test
    void getCurrentUser_returnsUserData() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john@example.com");
        user.setRole(ERole.TEACHER);

        ResponseObjectDto result = authController.getCurrentUser(user);

        assertTrue(result.getStatus());
        assertNotNull(result.getData());
    }

    @Test
    void logout_returnsSuccessMessage() {
        ResponseObjectDto result = authController.logout();

        assertFalse(result.getStatus()); // ResponseObjectDto(String) sets status=false
        assertEquals("Logged out successfully", result.getMessage());
    }
}
