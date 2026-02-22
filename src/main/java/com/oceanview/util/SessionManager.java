package com.oceanview.util;

import com.oceanview.model.User;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class SessionManager {
    private static SessionManager instance;
    private Map<String, User> activeSessions = new HashMap<>();

    private SessionManager() {
    }
    public static SessionManager getInstance() {
        if (instance == null) instance = new SessionManager();
        return instance;
    }

    public String createSession(User user) {
        String token = UUID.randomUUID().toString();
        User safeUser = new User();
        safeUser.setId(user.getId());
        safeUser.setUsername(user.getUsername());
        safeUser.setRole(user.getRole());

        activeSessions.put(token, safeUser);
        return token;
    }

    public boolean isValid(String token) {
        return activeSessions.containsKey(token);
    }

    public User getUser(String token) {
        return activeSessions.get(token);
    }

    public void invalidate(String token) {
        activeSessions.remove(token);
    }
}
