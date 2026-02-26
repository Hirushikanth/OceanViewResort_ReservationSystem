package com.oceanview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.dao.BookingDAO;
import com.oceanview.model.Booking;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/billing")
public class BillingServlet extends HttpServlet {

    private BookingDAO bookingDAO = new BookingDAO();
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        try {
            String idParam = req.getParameter("id");
            if (idParam == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Please provide booking ID (e.g., ?id=1)\"}");
                return;
            }

            Booking booking = bookingDAO.getBookingById(Integer.parseInt(idParam));

            if (booking == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.getWriter().write("{\"error\": \"Reservation not found\"}");
                return;
            }

            // Create a formatted Bill (Using LinkedHashMap to keep order)
            Map<String, Object> bill = new LinkedHashMap<>();
            bill.put("HOTEL_NAME", "OCEAN VIEW RESORT");
            bill.put("ADDRESS", "Galle, Sri Lanka");
            bill.put("----------------", "----------------");
            bill.put("Bill_Type", "OFFICIAL RECEIPT");
            bill.put("Reservation_No", booking.getReservationNumber());
            bill.put("Guest_Name", booking.getGuestName());
            bill.put("Guest_Address", booking.getAddress());
            bill.put("Guest_Contact", booking.getContactNumber());
            bill.put("Room_Type", booking.getRequestedType());
            bill.put("Check_In", booking.getCheckInDate().toString());
            bill.put("Check_Out", booking.getCheckOutDate().toString());
            bill.put("Status", booking.getStatus());
            bill.put("----------------", "----------------");
            bill.put("TOTAL_AMOUNT", "$" + booking.getTotalCost());
            bill.put("Message", "Thank you for staying with us!");

            mapper.writeValue(resp.getWriter(), bill);

        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Invalid ID format\"}");
        }
    }
}