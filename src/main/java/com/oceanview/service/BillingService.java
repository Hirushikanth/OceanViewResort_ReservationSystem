package com.oceanview.service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

public class BillingService {

    public double calculateTotal(Date checkIn, Date checkOut, double pricePerNight) {
        long diffInMillies = Math.abs(checkOut.getTime() - checkIn.getTime());
        long diffInDays = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);

        if (diffInDays == 0) {
            diffInDays = 1;
        }

        return diffInDays * pricePerNight;
    }
}