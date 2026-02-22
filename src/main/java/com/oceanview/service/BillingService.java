package com.oceanview.service;

import com.oceanview.model.Reservation;
import java.util.concurrent.TimeUnit;

public class BillingService {
    private static final double RATE_SINGLE = 100.00;
    private static final double RATE_DOUBLE = 150.00;
    private static final double RATE_SUITE = 250.00;

    public double calculateTotal(Reservation res) {
        long diffInMillies = Math.abs(res.getCheckOutDate().getTime() - res.getCheckInDate().getTime());
        long diff = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);

        if (diff == 0) diff = 1;

        double rate = 0;
        switch (res.getRoomType(). toUpperCase()) {
            case "SINGLE": rate = RATE_SINGLE; break;
            case "DOUBLE": rate = RATE_DOUBLE; break;
            case "SUITE": rate = RATE_SUITE; break;
        }
        return diff * rate;
    }
}
