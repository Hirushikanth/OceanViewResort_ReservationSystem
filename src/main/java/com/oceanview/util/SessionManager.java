package com.oceanview.util;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class SessionManager {
    private static SessionManager instance;
    private Map<String, String> activeSessions = new HashMap<>();

    private SessionManager() {
    }
    public static SessionManager getInstance() {
        if (instance == null) instance = new SessionManager();
        return instance;
    }

    public String createSession(String username) {
        String token = UUID.randomUUID().toString();
        activeSessions.put(token, username);
        return token;
    }

    public boolean isValid(String token) {
        return activeSessions.containsKey(token);
    }

    public String getUser(String token) {
        return activeSessions.get(token);
    }

    public void invalidate(String token) {
        activeSessions.remove(token);
    }
}
