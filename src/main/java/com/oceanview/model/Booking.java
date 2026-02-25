package com.oceanview.model;

import java.util.Date;

public class Booking {

    private int id;
    private int customerId;

    private Integer roomId;

    private String requestedType;

    private Date checkInDate;
    private Date checkOutDate;
    private double totalCost;
    private String status;

    public Booking() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getCustomerId() { return customerId; }
    public void setCustomerId(int customerId) { this.customerId = customerId; }
    public Integer getRoomId() { return roomId; }
    public void setRoomId(Integer roomId) { this.roomId = roomId; }
    public String getRequestedType() { return requestedType; }
    public void setRequestedType(String requestedType) { this.requestedType = requestedType; }
    public Date getCheckInDate() { return checkInDate; }
    public void setCheckInDate(Date checkInDate) { this.checkInDate = checkInDate; }
    public Date getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(Date checkOutDate) { this.checkOutDate = checkOutDate; }
    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}