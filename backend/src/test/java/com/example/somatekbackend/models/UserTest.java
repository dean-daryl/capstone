package com.example.somatekbackend.models;

import com.example.somatekbackend.dto.ERole;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void getAuthorities_returnsRoleWithPrefix() {
        User user = new User();
        user.setRole(ERole.TEACHER);

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertEquals(1, authorities.size());
        assertEquals("ROLE_TEACHER", authorities.iterator().next().getAuthority());
    }

    @Test
    void getUsername_returnsEmail() {
        User user = new User();
        user.setEmail("test@example.com");

        assertEquals("test@example.com", user.getUsername());
    }

    @Test
    void allRoles_haveCorrectAuthority() {
        for (ERole role : ERole.values()) {
            User user = new User();
            user.setRole(role);
            String expected = "ROLE_" + role.name();
            assertEquals(expected, user.getAuthorities().iterator().next().getAuthority());
        }
    }
}
