# 🌊 OceanView Resort Reservation System

A full-stack Java web application for managing hotel room reservations. This system enables customers to book rooms while allowing admins and staff to manage rooms, bookings, and users efficiently.

## 🚀 Features

* **Role-Based Access Control**: Different access levels for `ADMIN`, `STAFF`, and `CUSTOMER`.
* **Room Management**: View, add, and manage different room types (Single, Double, Deluxe) along with their pricing and availability status.
* **Reservation System**: Customers can book rooms by specifying check-in/check-out dates. The system automatically handles total cost calculation.
* **Booking Status Tracking**: Keep track of reservations using statuses: `PENDING`, `CONFIRMED`, or `CANCELLED`.
* **Database Integration**: Relational database schema mapping with MySQL/MariaDB.

## 🛠️ Tech Stack

* **Backend**: Java, Servlets
* **Build Tool**: Maven (`pom.xml`)
* **Frontend**: HTML, CSS, JavaScript
* **Database**: MySQL
* **Server**: Apache Tomcat (v10.1.52)
* **IDE**: IntelliJ IDEA

## 📋 Prerequisites

Before running this project locally, ensure you have the following installed:
* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (JDK 25)
* [Apache Tomcat 10.1.52](https://tomcat.apache.org/download-10.cgi)
* [MySQL](https://dev.mysql.com/downloads/mysql/)
* [Maven](https://maven.apache.org/)
* [IntelliJ IDEA](https://www.jetbrains.com/idea/) (Ultimate Edition is recommended for Jakarta/Java EE support)

## 🗄️ Database Setup

1. Start your local MySQL server (via XAMPP, WAMP, or standalone).
2. Create a new database named `oceanview`:
   ```sql
   CREATE DATABASE oceanview;
   USE oceanview;
   
   CREATE TABLE 'bookings' (
   'id' int(11) NOT NULL,
   'reservation_number' VARCHAR(50) DEFAULT NULL,
   'customer_id' int(11) NOT NULL,
   `guest_name` varchar(100) DEFAULT NULL,
   `address` varchar(255) DEFAULT NULL,
   `contact_number` varchar(20) DEFAULT NULL,
   `requested_type` varchar(50) NOT NULL,
   `room_id` int(11) DEFAULT NULL,
   `check_in_date` date NOT NULL,
   'check_out_date` date NOT NULL,
   `total_cost` double NOT NULL,
   `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
   `created_at` timestamp NOT NULL DEFAULT current_timestamp()
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
   
   ALTER TABLE `bookings`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `reservation_number` (`reservation_number`),
    ADD UNIQUE KEY `reservation_number_2` (`reservation_number`),
    ADD KEY `customer_id` (`customer_id`),
    ADD KEY `room_id` (`room_id`);
   
   CREATE TABLE `rooms` (
    `id` int(11) NOT NULL,
    `room_number` varchar(10) NOT NULL,
    `room_type` varchar(50) NOT NULL,
    `price_per_night` double NOT NULL,
    `is_active` tinyint(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
   
   ALTER TABLE `rooms`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `room_number` (`room_number`);
   
   INSERT INTO `rooms` (`id`, `room_number`, `room_type`, `price_per_night`, `is_active`) VALUES
    (1, '101', 'DELUXE', 500, 1),
    (2, '102', 'DELUXE', 500, 1),
    (3, '201', 'Double', 250, 1),
    (4, '202', 'Double', 250, 1),
    (5, '203', 'Single', 150, 1),
    (6, '301', 'Single', 150, 1),
    (7, '401', 'Double', 300, 1);
   
   CREATE TABLE `users` (
    `id` int(11) NOT NULL,
    `username` varchar(50) NOT NULL,
    `password` varchar(255) NOT NULL,
    `role` enum('ADMIN','STAFF','CUSTOMER') NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
   
   ALTER TABLE `users`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `username` (`username`);
   
   INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
    `(1, 'admin', '$2a$12$tNn92k8ndudsmrF.ZX3MA./.HqTDUyH45776XubtisDzWs1NDDFmy', 'ADMIN');`
   
   ALTER TABLE `bookings`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
   
   ALTER TABLE `rooms`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
   
   ALTER TABLE `users`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
   
   ALTER TABLE `bookings`
    ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL;
    COMMIT;
   
## ⚙️ IDE Configuration (IntelliJ IDEA)

To run the project locally using IntelliJ IDEA, configure your Tomcat server exactly as follows:

### 1. Add Tomcat Server Configuration
* Go to Run -> Edit Configurations...
* Click the + icon in the top left, select Tomcat Server -> Local.
* Set the Name to OceanView.

### 2. "Server" Tab Settings
* Application server: Select Tomcat 10.1.52 (or your installed 10.1.x version).
* Open browser URL: http://localhost:8080/OceanView/
* On 'Update' action: Restart server (Check the "Show dialog" box).
* On frame deactivation: Do nothing.
* JRE: Select your project's default SDK.
* HTTP port: 8080

### 3. "Deployment" Tab Settings
* Click the + icon and select Artifact...
* Choose OceanViewResort:war exploded.
* Under Application context at the bottom, enter: /OceanView
* Click Apply, then OK.

### ▶️ Running the Application
* Make sure your local database server is running.
* Update the database connection credentials (username/password) in your Java database utility class (e.g., DBConnection.java) to match your local MySQL setup.
* In IntelliJ IDEA, select the OceanView configuration from the Run menu and click the Run (Play) button.
* Tomcat will build and deploy the application. Once deployed, your default web browser will automatically open to: http://localhost:8080/OceanView/
