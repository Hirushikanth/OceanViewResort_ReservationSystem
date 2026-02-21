package com.oceanview.main;

import com.oceanview.dao.UserDAO;
import com.oceanview.model.User;
import com.oceanview.util.SessionManager;

public class TestLogin {
    public static void main(String[] args) {
        UserDAO userDAO = new UserDAO();

        System.out.println("Testing Valid Login...");
        User admin = userDAO.authenticate("admin", "password123");

        if (admin != null) {
            System.out.println("✅ Login Successful: " + admin.getUsername());
            String token = SessionManager.getInstance().createSession(admin.getUsername());
            System.out.println("Generated Token: " + token);
        } else {
            System.out.println("❌ Login Failed!");
        }

        System.out.println("\nTesting Invalid Login...");
        User hacker = userDAO.authenticate("admin", "wrongpass");

        if (hacker == null) {
            System.out.println("✅ Security Check Passed (Login Blocked)");
        } else {
            System.out.println("❌ Security Breach! (Login Allowed)");
        }
    }
}
