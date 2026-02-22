package com.oceanview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.dao.BookingDAO;
import com.oceanview.dao.RoomDAO;
import com.oceanview.model.Booking;
import com.oceanview.model.Room;
import com.oceanview.model.User;
import com.oceanview.service.BillingService;
import com.oceanview.util.SessionManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/api/bookings")
public class BookingServlet extends HttpServlet {

    private BookingDAO bookingDAO = new BookingDAO();
    private RoomDAO roomDAO = new RoomDAO();
    private BillingService billingService = new BillingService();
    private ObjectMapper mapper = new ObjectMapper();

    private User getAuthenticatedUser(HttpServletRequest req) {
        String token = req.getHeader("Authorization");
        return (token != null) ? SessionManager.getInstance().getUser(token) : null;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        User user = getAuthenticatedUser(req);

        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Please login\"}");
            return;
        }

        List<Booking> bookings;
        if ("CUSTOMER".equals(user.getRole())) {
            bookings = bookingDAO.getBookingsByCustomer(user.getId());
        } else {
            bookings = bookingDAO.getAllBookings();
        }

        mapper.writeValue(resp.getWriter(), bookings);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        User user = getAuthenticatedUser(req);

        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            Booking newBooking = mapper.readValue(req.getReader(), Booking.class);

            newBooking.setCustomerId(user.getId());

            Room room = roomDAO.getRoomById(newBooking.getRoomId());
            if (room == null || !room.isActive()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Invalid or inactive room\"}");
                return;
            }

            double cost = billingService.calculateTotal(newBooking.getCheckInDate(), newBooking.getCheckOutDate(), room.getPricePerNight());
            newBooking.setTotalCost(cost);

            boolean success = bookingDAO.createBooking(newBooking);

            if (success) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write("{\"message\": \"Booking requested successfully. Awaiting confirmation.\", \"estimatedCost\": " + cost + "}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            e.printStackTrace();
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        User user = getAuthenticatedUser(req);

        if (user == null || "CUSTOMER".equals(user.getRole())) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\": \"Only staff can update booking status\"}");
            return;
        }

        try {
            Map<String, Object> updateData = mapper.readValue(req.getReader(), Map.class);
            int bookingId = (Integer) updateData.get("id");
            String newStatus = (String) updateData.get("status");

            boolean success = bookingDAO.updateStatus(bookingId, newStatus);

            if (success) {
                resp.getWriter().write("{\"message\": \"Booking status updated to " + newStatus + "\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Failed to update status\"}");
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}