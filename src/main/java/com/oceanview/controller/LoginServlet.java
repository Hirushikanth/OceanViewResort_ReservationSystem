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
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private UserDAO userDAO = new UserDAO();
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        try {
            User loginRequest = mapper.readValue(req.getReader(), User.class);

            User user = userDAO.authenticate(loginRequest.getUsername(), loginRequest.getPasswordHash());

            if (user != null) {

                String token = SessionManager.getInstance().createSession(user.getUsername());

                Map<String, String> responseMap = new HashMap<>();
                responseMap.put("message", "Login Successful");
                responseMap.put("token", token);
                responseMap.put("role", user.getRole());

                resp.setStatus(HttpServletResponse.SC_OK);
                mapper.writeValue(resp.getWriter(), responseMap);
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                Map<String, String> errorMap = new HashMap<>();
                errorMap.put("message", "Invalid Credentials");
                mapper.writeValue(resp.getWriter(), errorMap);
            }
        }  catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Invalid JSON Format\"}");
        }
    }
}
