package com.example.somatekbackend.util;

import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class TokenUtilTest {

    private TokenUtil tokenUtil;

    @BeforeEach
    void setUp() {
        tokenUtil = new TokenUtil();
        ReflectionTestUtils.setField(tokenUtil, "secret", "test-secret-key-for-unit-tests");
        ReflectionTestUtils.setField(tokenUtil, "tokenValidity", 18000L);
    }

    @Test
    void generateAndValidateToken() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(ERole.STUDENT);

        String token = tokenUtil.generateToken(user, "STUDENT");

        assertTrue(tokenUtil.validateToken(token));
    }

    @Test
    void getUsernameFromToken() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(ERole.TEACHER);

        String token = tokenUtil.generateToken(user, "TEACHER");

        assertEquals("test@example.com", tokenUtil.getUsernameFromToken(token));
    }

    @Test
    void getRoleFromToken() {
        User user = new User();
        user.setEmail("admin@example.com");
        user.setRole(ERole.ADMIN);

        String token = tokenUtil.generateToken(user, "ADMIN");

        assertEquals("ADMIN", tokenUtil.getRoleFromToken(token));
    }

    @Test
    void validateToken_invalidToken_returnsFalse() {
        assertFalse(tokenUtil.validateToken("invalid.token.here"));
    }

    @Test
    void generateToken_withoutExplicitRole_usesAuthorityRole() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(ERole.TEACHER);

        String token = tokenUtil.generateToken(user);

        assertEquals("TEACHER", tokenUtil.getRoleFromToken(token));
    }
}
