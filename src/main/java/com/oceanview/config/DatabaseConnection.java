package com.oceanview.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static DatabaseConnection instance;
    private Connection connection;

    private static final String URL = "jdbc:mysql://localhost:3306/oceanview";
    private static final String USER = "root";
    private static final String PASSWORD = "";

    private DatabaseConnection() {
        try {
            // Load the driver class (Optional in newer Java, but good for safety)
            Class.forName("com.mysql.cj.jdbc.Driver");

            this.connection = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("✅ Database Connected Successfully!");

        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("❌ Database Connection Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static DatabaseConnection getInstance() throws SQLException {
        if (instance == null) {
            instance = new DatabaseConnection();
        } else if (instance.getConnection().isClosed()) {
            // Reconnect if connection was lost
            instance = new DatabaseConnection();
        }
        return instance;
    }

    public Connection getConnection() {
        return connection;
    }

}
