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
            return;
        }

        List<Booking> bookings;
        // Logic Split based on Role
        if ("CUSTOMER".equals(user.getRole())) {
            // Customers see their own history
            bookings = bookingDAO.getBookingsByCustomer(user.getId());
        } else {
            // ADMIN / STAFF Logic
            String statusFilter = req.getParameter("status");

            if ("PENDING".equals(statusFilter)) {
                // Fetch only actionable items
                bookings = bookingDAO.getPendingBookings();
            } else {
                // Fetch everything (History)
                bookings = bookingDAO.getAllBookings();
            }
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
            // 1. Parse incoming JSON
            Booking newBooking = mapper.readValue(req.getReader(), Booking.class);

            // 2. Validate Input
            if (newBooking.getRequestedType() == null || newBooking.getCheckInDate() == null || newBooking.getCheckOutDate() == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Missing required fields: requestedType, checkInDate, checkOutDate\"}");
                return;
            }

            // 3. Set Defaults
            newBooking.setCustomerId(user.getId());
            newBooking.setRoomId(null); // Explicitly NULL because no room is assigned yet
            newBooking.setStatus("PENDING");

            // 4. Calculate Cost based on Type (not specific room)
            double pricePerNight = roomDAO.getPriceByType(newBooking.getRequestedType());

            if (pricePerNight == 0.0) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Invalid Room Type\"}");
                return;
            }

            double cost = billingService.calculateTotal(newBooking.getCheckInDate(), newBooking.getCheckOutDate(), pricePerNight);
            newBooking.setTotalCost(cost);

            // 5. Save to DB
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

        // 1. Security Check: Only Staff/Admin can assign rooms
        if (user == null || "CUSTOMER".equals(user.getRole())) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            resp.getWriter().write("{\"error\": \"Only staff can manage bookings\"}");
            return;
        }

        try {
            // 2. Parse Request
            Map<String, Object> updateData = mapper.readValue(req.getReader(), Map.class);

            // Validate ID exists
            if (!updateData.containsKey("id") || !updateData.containsKey("status")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            int bookingId = (Integer) updateData.get("id");
            String newStatus = (String) updateData.get("status");

            // 3. Handle CONFIRMATION (Requires Room Assignment)
            if ("CONFIRMED".equals(newStatus)) {

                // Check if room ID was provided
                if (!updateData.containsKey("roomId")) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write("{\"error\": \"Cannot confirm without assigning a Room ID\"}");
                    return;
                }

                int assignedRoomId = (Integer) updateData.get("roomId");

                // A. Fetch the original booking to get the dates
                Booking pendingBooking = bookingDAO.getBookingById(bookingId);
                if (pendingBooking == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }

                java.sql.Date sqlCheckIn = new java.sql.Date(pendingBooking.getCheckInDate().getTime());
                java.sql.Date sqlCheckOut = new java.sql.Date(pendingBooking.getCheckOutDate().getTime());

                // B. CRITICAL CHECK: Is the room actually available?
                boolean isAvailable = bookingDAO.isRoomAvailable(
                        assignedRoomId,
                        sqlCheckIn,
                        sqlCheckOut
                );

                if (!isAvailable) {
                    resp.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
                    resp.getWriter().write("{\"error\": \"Room " + assignedRoomId + " is already occupied for these dates.\"}");
                    return;
                }

                // C. Assign and Confirm
                boolean success = bookingDAO.assignRoomAndConfirm(bookingId, assignedRoomId);
                if (success) {
                    resp.getWriter().write("{\"message\": \"Booking confirmed and Room " + assignedRoomId + " assigned.\"}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }

            }
            // 4. Handle CANCELLATION (No Room Needed)
            else if ("CANCELLED".equals(newStatus)) {
                boolean success = bookingDAO.updateStatusOnly(bookingId, "CANCELLED");
                if (success) {
                    resp.getWriter().write("{\"message\": \"Booking cancelled.\"}");
                }
            }
            else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Invalid status update\"}");
            }

        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            e.printStackTrace();
        }
    }
}