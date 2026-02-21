package com.oceanview.dao;

import com.oceanview.config.DatabaseConnection;
import com.oceanview.model.User;
import com.oceanview.util.SecurityUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {
    public User authenticate(String username, String rawPassword) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            String hashedPassword = SecurityUtil.hashPassword(rawPassword);

            stmt.setString(1, username);
            stmt.setString(2, hashedPassword);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new User(
                        rs.getInt("id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("role")
                );
            }
        }catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
