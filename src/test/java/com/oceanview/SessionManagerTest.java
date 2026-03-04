package com.oceanview;

import com.oceanview.model.User;
import com.oceanview.util.SessionManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SessionManagerTest {

    @Test
    public void testSingletonInstance() {
        SessionManager instance1 = SessionManager.getInstance();
        SessionManager instance2 = SessionManager.getInstance();

        assertSame(instance1, instance2, "Both instances should point to the exact same object in memory.");
    }

    @Test
    public void testCreateAndValidateSession() {
        // Arrange
        SessionManager sessionManager = SessionManager.getInstance();
        User testUser = new User(1, "testuser", null, "CUSTOMER");

        // Act
        String token = sessionManager.createSession(testUser);

        // Assert
        assertNotNull(token);
        assertTrue(sessionManager.isValid(token), "Token should be valid immediately after creation.");

        User retrievedUser = sessionManager.getUser(token);
        assertEquals("testuser", retrievedUser.getUsername());
    }

    @Test
    public void testInvalidateSession() {
        // Arrange
        SessionManager sessionManager = SessionManager.getInstance();
        User testUser = new User(2, "logoutuser", null, "CUSTOMER");
        String token = sessionManager.createSession(testUser);

        // Act
        sessionManager.invalidate(token);

        // Assert
        assertFalse(sessionManager.isValid(token), "Token should be invalid after logging out.");
        assertNull(sessionManager.getUser(token));
    }
}