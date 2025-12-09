package com.employee.Emp.Service;

import java.util.List;

public class ApplyDiscountRequest {
    private Long customerId;
    private Integer userId; // For cart lookup
    private List<String> couponCodes; // Multiple coupons if stackable
    private boolean autoApply; // Whether to auto-apply available discounts

    // Constructors
    public ApplyDiscountRequest() {}

    public ApplyDiscountRequest(Long customerId, Integer userId) {
        this.customerId = customerId;
        this.userId = userId;
        this.autoApply = true;
    }

    public ApplyDiscountRequest(Long customerId, Integer userId, List<String> couponCodes, boolean autoApply) {
        this.customerId = customerId;
        this.userId = userId;
        this.couponCodes = couponCodes;
        this.autoApply = autoApply;
    }

    // Getters and setters
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public List<String> getCouponCodes() { return couponCodes; }
    public void setCouponCodes(List<String> couponCodes) { this.couponCodes = couponCodes; }

    public boolean isAutoApply() { return autoApply; }
    public void setAutoApply(boolean autoApply) { this.autoApply = autoApply; }
}