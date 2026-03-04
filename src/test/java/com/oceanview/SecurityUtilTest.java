package com.oceanview;

import com.oceanview.util.SecurityUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SecurityUtilTest {

    @Test
    public void testHashPassword_GeneratesValidBCryptHash() {
        // Arrange
        String plainPassword = "AdminPassword123!";

        // Act
        String hash = SecurityUtil.hashPassword(plainPassword);

        // Assert
        assertNotNull(hash);
        assertTrue(hash.startsWith("$2a$"), "BCrypt hash should start with $2a$");
        assertNotEquals(plainPassword, hash, "Hash should not equal plain text");
    }

    @Test
    public void testCheckPassword_ValidPassword_ReturnsTrue() {
        // Arrange
        String plainPassword = "SecurePass123";
        String hash = SecurityUtil.hashPassword(plainPassword);

        // Act
        boolean isMatch = SecurityUtil.checkPassword(plainPassword, hash);

        // Assert
        assertTrue(isMatch, "Valid password should return true");
    }

    @Test
    public void testCheckPassword_InvalidPassword_ReturnsFalse() {
        // Arrange
        String plainPassword = "SecurePass123";
        String wrongPassword = "WrongPass123";
        String hash = SecurityUtil.hashPassword(plainPassword);

        // Act
        boolean isMatch = SecurityUtil.checkPassword(wrongPassword, hash);

        // Assert
        assertFalse(isMatch, "Invalid password should return false");
    }
}