package com.oceanview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.dao.UserDAO;
import com.oceanview.model.User;
import com.oceanview.util.SessionManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/users")
public class UserServlet extends HttpServlet {
    private UserDAO userDAO = new UserDAO();
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String token = req.getHeader("Authorization");

        //RBAC
        User currentUser = SessionManager.getInstance().getUser(token);
        if (currentUser == null || !"ADMIN".equals(currentUser.getRole())) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            resp.getWriter().write("{\"error\": \"Admin access required\"}");
            return;
        }
        List<User> staff = userDAO.getStaffMembers();
        mapper.writeValue(resp.getWriter(), staff);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        try {
            User newUser = mapper.readValue(req.getReader(), User.class);

            if ("STAFF".equals(newUser.getRole()) || "ADMIN".equals(newUser.getRole())) {
                String token = req.getHeader("Authorization");
                User currentUser = SessionManager.getInstance().getUser(token);
                if (currentUser == null || !"ADMIN".equals(currentUser.getRole())) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    resp.getWriter().write("{\"error\": \"Only Admins can create Staff accounts\"}");
                    return;
                }
            } else {
                newUser.setRole("CUSTOMER");
            }

            boolean success = userDAO.registerUser(newUser);
            if (success) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write("{\"message\": \"User registered successfully\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Username might already exist\"}");
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            e.printStackTrace();
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String token = req.getHeader("Authorization");

        User currentUser = SessionManager.getInstance().getUser(token);
        if (currentUser == null || !"ADMIN".equals(currentUser.getRole())) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        try {
            int userId = Integer.parseInt(req.getParameter("id"));
            boolean success = userDAO.deleteUser(userId);
            if (success) {
                resp.getWriter().write("{\"message\": \"User deleted\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
