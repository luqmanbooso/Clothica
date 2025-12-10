package com.employee.Emp.Service;

public class CouponValidationRequest {
    private String couponCode;
    private Long customerId;
    private Long userId; // For cart lookup

    // Constructors
    public CouponValidationRequest() {}

    public CouponValidationRequest(String couponCode, Long customerId) {
        this.couponCode = couponCode;
        this.customerId = customerId;
    }

    public CouponValidationRequest(String couponCode, Long customerId, Long userId) {
        this.couponCode = couponCode;
        this.customerId = customerId;
        this.userId = userId;
    }

    // Getters and setters
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
