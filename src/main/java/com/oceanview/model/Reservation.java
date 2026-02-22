package com.oceanview.model;

import java.util.Date;

public class Reservation {
    private int id;
    private String guestName;
    private String roomType;
    private String contactNumber;
    private Date checkInDate;
    private Date checkOutDate;
    private double totalCost;

    public Reservation() {}

    public Reservation(int id, String guestName, String roomType, String contactNumber, Date checkInDate, Date checkOutDate, double totalCost) {
        this.id = id;
        this.guestName = guestName;
        this.roomType = roomType;
        this.contactNumber = contactNumber;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalCost = totalCost;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public Date getCheckInDate() { return checkInDate; }
    public void setCheckInDate(Date checkInDate) { this.checkInDate = checkInDate; }
    public Date getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(Date checkOutDate) { this.checkOutDate = checkOutDate; }
    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }
}
