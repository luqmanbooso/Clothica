package com.employee.Emp.Entity;

import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.OrderContext;

public class Promotion extends Discount {
    private Boolean autoApply = false; // Apply automatically if conditions met
    private String promotionBannerText;
    private String promotionImageUrl;

    @Override
    public DiscountCalculationResult calculateDiscount(OrderContext context) {
        return null;
    }
}
