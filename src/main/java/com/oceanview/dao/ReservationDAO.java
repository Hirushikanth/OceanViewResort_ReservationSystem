package com.oceanview.dao;

import com.oceanview.config.DatabaseConnection;
import com.oceanview.model.Reservation;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReservationDAO {

    public boolean addReservation(Reservation res) {
        String sql = "INSERT INTO reservations (guest_name, room_type, contact_number, check_in_date, check_out_date, total_cost) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, res.getGuestName());
            stmt.setString(2, res.getRoomType());
            stmt.setString(3, res.getContactNumber());
            stmt.setDate(4, new java.sql.Date(res.getCheckInDate().getTime()));
            stmt.setDate(5, new java.sql.Date(res.getCheckOutDate().getTime()));
            stmt.setDouble(6, res.getTotalCost());

            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Reservation> getAllReservations() {
        List<Reservation> list = new ArrayList<>();
        String sql = "SELECT * FROM reservations ORDER BY created_at DESC";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Reservation res = new Reservation(
                        rs.getInt("id"),
                        rs.getString("guest_name"),
                        rs.getString("room_type"),
                        rs.getString("contact_number"),
                        rs.getDate("check_in_date"),
                        rs.getDate("check_out_date"),
                        rs.getDouble("total_cost")
                );
                list.add(res);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}