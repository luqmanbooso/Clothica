package com.employee.Emp.Service;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.filter.DiscountCalculationResult;

public class DiscountValidationResponse {
    private boolean valid;
    private String message;
    private Discount discount;
    private DiscountCalculationResult preview;

    // Constructors
    public DiscountValidationResponse() {}

    public DiscountValidationResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public DiscountValidationResponse(boolean valid, String message, Discount discount, DiscountCalculationResult preview) {
        this.valid = valid;
        this.message = message;
        this.discount = discount;
        this.preview = preview;
    }

    // Getters and setters
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Discount getDiscount() { return discount; }
    public void setDiscount(Discount discount) { this.discount = discount; }

    public DiscountCalculationResult getPreview() { return preview; }
    public void setPreview(DiscountCalculationResult preview) { this.preview = preview; }
}