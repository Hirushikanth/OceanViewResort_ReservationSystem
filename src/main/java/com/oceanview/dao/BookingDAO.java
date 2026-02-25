package com.oceanview.dao;

import com.oceanview.config.DatabaseConnection;
import com.oceanview.model.Booking;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {

    public boolean createBooking(Booking booking) {
        String sql = "INSERT INTO bookings (customer_id, requested_type, room_id, check_in_date, check_out_date, total_cost, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, booking.getCustomerId());
            stmt.setString(2, booking.getRequestedType());

            if (booking.getRoomId() == null) {
                stmt.setNull(3, Types.INTEGER);
            } else {
                stmt.setInt(3, booking.getRoomId());
            }

            stmt.setDate(4, new java.sql.Date(booking.getCheckInDate().getTime()));
            stmt.setDate(5, new java.sql.Date(booking.getCheckOutDate().getTime()));
            stmt.setDouble(6, booking.getTotalCost());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Booking> getAllBookings() {
        return fetchBookings("SELECT * FROM bookings ORDER BY created_at DESC");
    }

    public List<Booking> getBookingsByCustomer(int customerId) {
        return fetchBookings("SELECT * FROM bookings WHERE customer_id = " + customerId + " ORDER BY created_at DESC");
    }

    public List<Booking> getPendingBookings() {
        return fetchBookings("SELECT * FROM bookings WHERE status = 'PENDING' ORDER BY check_in_date ASC");
    }

    public Booking getBookingById(int id) {
        List<Booking> list = fetchBookings("SELECT * FROM bookings WHERE id = " + id);
        return list.isEmpty() ? null : list.get(0);
    }

    public boolean assignRoomAndConfirm(int bookingId, int roomId) {
        String sql = "UPDATE bookings SET room_id = ?, status = 'CONFIRMED' WHERE id = ?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, roomId);
            stmt.setInt(2, bookingId);

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateStatusOnly(int bookingId, String status) {
        String sql = "UPDATE bookings SET status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            stmt.setInt(2, bookingId);

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private List<Booking> fetchBookings(String sql) {
        List<Booking> list = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Booking b = new Booking();
                b.setId(rs.getInt("id"));
                b.setCustomerId(rs.getInt("customer_id"));
                b.setRequestedType(rs.getString("requested_type"));

                int rId = rs.getInt("room_id");
                if (rs.wasNull()) {
                    b.setRoomId(null);
                } else {
                    b.setRoomId(rId);
                }

                b.setCheckInDate(rs.getDate("check_in_date"));
                b.setCheckOutDate(rs.getDate("check_out_date"));
                b.setTotalCost(rs.getDouble("total_cost"));
                b.setStatus(rs.getString("status"));
                list.add(b);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean isRoomAvailable(int roomId, Date checkIn, Date checkOut) {
        // Logic: Count bookings for this room that are NOT cancelled
        // and Overlap with the requested dates.
        // Overlap Formula: (StartA < EndB) and (EndA > StartB)

        String sql = "SELECT COUNT(*) FROM bookings WHERE room_id = ? " +
                "AND status != 'CANCELLED' " +
                "AND (check_in_date < ? AND check_out_date > ?)";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, roomId);
            stmt.setDate(2, new java.sql.Date(checkOut.getTime()));
            stmt.setDate(3, new java.sql.Date(checkIn.getTime()));

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) == 0; // Returns TRUE if count is 0 (Room is free)
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false; // Assume occupied on error for safety
    }
}