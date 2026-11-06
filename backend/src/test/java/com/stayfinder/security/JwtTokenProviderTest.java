package com.stayfinder.security;

import com.stayfinder.config.JwtConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtConfig jwtConfig;

    @BeforeEach
    void setUp() {
        jwtConfig = new JwtConfig();
        jwtConfig.setSecret("9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b");
        jwtConfig.setAccessTokenExpiration(900000L); // 15 mins
        jwtConfig.setRefreshTokenExpiration(604800000L); // 7 days

        jwtTokenProvider = new JwtTokenProvider(jwtConfig);
    }

    @Test
    @DisplayName("Successfully generates and validates access token with correct claims")
    void testGenerateAccessToken_Valid() {
        String token = jwtTokenProvider.generateAccessToken(42L, "guest@staywise.com", "USER");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(42L, jwtTokenProvider.getUserIdFromToken(token));
        assertEquals("guest@staywise.com", jwtTokenProvider.getEmailFromToken(token));
        assertEquals("USER", jwtTokenProvider.getRoleFromToken(token));
        assertFalse(jwtTokenProvider.isRefreshToken(token));
    }

    @Test
    @DisplayName("Successfully generates and identifies refresh token")
    void testGenerateRefreshToken_Valid() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(42L, "guest@staywise.com", "USER");

        assertNotNull(refreshToken);
        assertTrue(jwtTokenProvider.validateToken(refreshToken));
        assertTrue(jwtTokenProvider.isRefreshToken(refreshToken));
        assertEquals(42L, jwtTokenProvider.getUserIdFromToken(refreshToken));
    }

    @Test
    @DisplayName("validateToken returns false for malformed or tampered token")
    void testValidateToken_TamperedToken() {
        String token = jwtTokenProvider.generateAccessToken(42L, "guest@staywise.com", "USER");
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("validateToken returns false for empty or garbage string")
    void testValidateToken_InvalidString() {
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
    }
}
