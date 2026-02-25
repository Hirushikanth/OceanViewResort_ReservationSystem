package com.oceanview.util;

import com.oceanview.model.User;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private static SessionManager instance;

    private Map<String, User> activeSessions = new ConcurrentHashMap<>();

    private SessionManager() {}

    public static synchronized SessionManager getInstance() {
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
        return token != null && activeSessions.containsKey(token);
    }

    public User getUser(String token) {
        return (token != null) ? activeSessions.get(token) : null;
    }

    public void invalidate(String token) {
        if (token != null) {
            activeSessions.remove(token);
        }
    }
}