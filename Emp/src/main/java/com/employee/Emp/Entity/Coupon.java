package com.employee.Emp.Entity;

import com.employee.Emp.Enum.DiscountValueType;
import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.OrderContext;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("COUPON")
public class Coupon extends Discount {
    private String couponCode;
    private Boolean isSingleUse = false;
    private Boolean isFirstOrderOnly = false;
    private String customerEmail; // For personalized coupons

    @Override
    public DiscountCalculationResult calculateDiscount(OrderContext context) {
        BigDecimal discountAmount = BigDecimal.ZERO;

        if (getValueType() == DiscountValueType.PERCENTAGE) {
            discountAmount = context.getSubtotal().multiply(getDiscountValue()).divide(BigDecimal.valueOf(100), 2,
                    java.math.RoundingMode.HALF_UP);
        } else if (getValueType() == DiscountValueType.FIXED_AMOUNT) {
            discountAmount = getDiscountValue();
        }

        // Apply maximum discount limit if set
        if (getMaximumDiscountAmount() != null && discountAmount.compareTo(getMaximumDiscountAmount()) > 0) {
            discountAmount = getMaximumDiscountAmount();
        }

        return new DiscountCalculationResult.Builder()
                .discountAmount(discountAmount)
                .discountName(getName())
                .discountCode(getCode())
                .appliedDiscount(this)
                .valueType(getValueType())
                .message("Coupon applied: " + getName())
                .build();
    }

    // Additional coupon-specific logic

    // Getters and setters
    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public Boolean getIsSingleUse() {
        return isSingleUse;
    }

    public void setIsSingleUse(Boolean isSingleUse) {
        this.isSingleUse = isSingleUse;
    }

    public Boolean getIsFirstOrderOnly() {
        return isFirstOrderOnly;
    }

    public void setIsFirstOrderOnly(Boolean isFirstOrderOnly) {
        this.isFirstOrderOnly = isFirstOrderOnly;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
}