package com.oceanview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/help")
public class HelpServlet extends HttpServlet {

    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        Map<String, String> helpGuide = new LinkedHashMap<>();
        helpGuide.put("TITLE", "OCEAN VIEW RESORT - SYSTEM GUIDE");
        helpGuide.put("1. Login", "POST /api/login | Body: {username, passwordHash}");
        helpGuide.put("2. New Reservation", "POST /api/bookings | Body: {guestName, address, contactNumber, requestedType, checkInDate, checkOutDate}");
        helpGuide.put("3. Confirm Booking", "PUT /api/bookings | Staff Only. Body: {id, status: 'CONFIRMED', roomId: 101}");
        helpGuide.put("4. View Details", "GET /api/bookings?id={id}");
        helpGuide.put("5. Print Bill", "GET /api/billing?id={id}");
        helpGuide.put("6. Exit System", "DELETE /api/login | Requires Token Header");

        mapper.writeValue(resp.getWriter(), helpGuide);
    }
}