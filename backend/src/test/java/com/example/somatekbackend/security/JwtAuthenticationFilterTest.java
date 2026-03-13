package com.example.somatekbackend.security;

import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.util.TokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private TokenUtil tokenUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_noAuthHeader_continuesChain() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_validToken_setsAuthentication() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(ERole.STUDENT);

        when(tokenUtil.validateToken("valid-token")).thenReturn(true);
        when(tokenUtil.getUsernameFromToken("valid-token")).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(user);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test@example.com",
                ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getEmail());
    }

    @Test
    void doFilterInternal_invalidToken_continuesWithoutAuth() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(tokenUtil.validateToken("bad-token")).thenReturn(false);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldNotFilter_loginPath_returnsTrue() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/auth/login");

        assertTrue(jwtAuthenticationFilter.shouldNotFilter(request));
    }

    @Test
    void shouldNotFilter_signupPath_returnsTrue() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/auth/signup");

        assertTrue(jwtAuthenticationFilter.shouldNotFilter(request));
    }

    @Test
    void shouldNotFilter_otherPath_returnsFalse() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/rag/documents");

        assertFalse(jwtAuthenticationFilter.shouldNotFilter(request));
    }
}
