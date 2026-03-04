package com.oceanview;

import com.oceanview.service.BillingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Calendar;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BillingServiceTest {

    private BillingService billingService;

    @BeforeEach
    public void setUp() {
        // This runs before every test
        billingService = new BillingService();
    }

    @Test
    public void testCalculateTotal_MultipleNights() {
        // Arrange
        Calendar cal = Calendar.getInstance();
        cal.set(2026, Calendar.MARCH, 10);
        Date checkIn = cal.getTime();

        cal.set(2026, Calendar.MARCH, 13); // 3 nights later
        Date checkOut = cal.getTime();

        double pricePerNight = 150.0;

        // Act
        double total = billingService.calculateTotal(checkIn, checkOut, pricePerNight);

        // Assert
        assertEquals(450.0, total, "Total should be 3 nights * $150 = $450");
    }

    @Test
    public void testCalculateTotal_SameDayCheckout_DefaultsToOneNight() {
        // Arrange
        Calendar cal = Calendar.getInstance();
        cal.set(2026, Calendar.MARCH, 10);
        Date checkIn = cal.getTime();
        Date checkOut = cal.getTime(); // Same day

        double pricePerNight = 200.0;

        // Act
        double total = billingService.calculateTotal(checkIn, checkOut, pricePerNight);

        // Assert
        assertEquals(200.0, total, "If check-in and check-out are the same day, it should charge for 1 night minimum.");
    }
}