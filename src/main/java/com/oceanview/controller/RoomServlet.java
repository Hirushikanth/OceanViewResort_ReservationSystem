package com.oceanview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.dao.RoomDAO;
import com.oceanview.model.Room;
import com.oceanview.model.User;
import com.oceanview.util.SessionManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Date;
import java.util.List;

@WebServlet("/api/rooms")
public class RoomServlet extends HttpServlet {

    private RoomDAO roomDAO = new RoomDAO();
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        String checkInStr = req.getParameter("checkIn");
        String checkOutStr = req.getParameter("checkOut");

        try {
            if (checkInStr != null && checkOutStr != null) {
                Date checkIn = Date.valueOf(checkInStr);
                Date checkOut = Date.valueOf(checkOutStr);

                List<Room> availbleRooms = roomDAO.getAvailableRooms(checkIn, checkOut);
                mapper.writeValue(resp.getWriter(), availbleRooms);
            } else {
                String token = req.getHeader("Authorization");
                User currentUser = SessionManager.getInstance().getUser(token);

                if (currentUser == null || "CUSTOMER".equals(currentUser.getRole())) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    resp.getWriter().write("{\"error\": \"Access Denied. Admins/Staff only.\"}");
                    return;
                }

                List<Room> allRooms = roomDAO.getAllRooms();
                mapper.writeValue(resp.getWriter(), allRooms);
            }
        } catch (IllegalArgumentException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Invalid date format. Use YYYY-MM-DD\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        String token = req.getHeader("Authorization");
        User currentUser = SessionManager.getInstance().getUser(token);

        if (currentUser == null || !"ADMIN".equals(currentUser.getRole())) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\": \"Only Admins can manage room inventory\"}");
            return;
        }

        try {
            Room newRoom = mapper.readValue(req.getReader(), Room.class);
            boolean success = roomDAO.addRoom(newRoom);

            if (success) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write("{\"message\": \"Room added successfully\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Failed to add room. Room number might already exist.\"}");
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            e.printStackTrace();
        }
    }
}
