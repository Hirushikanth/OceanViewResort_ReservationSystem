package com.oceanview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanview.dao.ReservationDAO;
import com.oceanview.model.Reservation;
import com.oceanview.service.BillingService;
import com.oceanview.util.SessionManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/reservations")
public class ReservationServlet extends HttpServlet {
    private ReservationDAO reservationDAO = new ReservationDAO();
    private BillingService billingService = new BillingService();
    private ObjectMapper mapper = new ObjectMapper();

    private boolean isAuthorized(HttpServletRequest req) {
        String token = req.getHeader("Authorization");
        return token != null && SessionManager.getInstance().isValid(token);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        if (!isAuthorized(req)) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Access Denied\"}");
            return;
        }

        List<Reservation> reservations = reservationDAO.getAllReservations();

        mapper.writeValue(resp.getWriter(), reservations);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        if (!isAuthorized(req)) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            Reservation newRes = mapper.readValue(req.getReader(), Reservation.class);

            double cost = billingService.calculateTotal(newRes);
            newRes.setTotalCost(cost);

            boolean success = reservationDAO.addReservation(newRes);

            if (success) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write("{\"message\": \"Reservation Created\", \"cost\": " + cost + "}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"error\": \"Database Error\"}");
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            e.printStackTrace();
        }
    }
}