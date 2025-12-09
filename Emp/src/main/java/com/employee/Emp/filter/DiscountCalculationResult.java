package com.employee.Emp.filter;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Enum.DiscountValueType;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class DiscountCalculationResult {
    private BigDecimal discountAmount;
    private String discountName;
    private String discountCode;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Discount appliedDiscount;
    private Map<Long, BigDecimal> itemDiscounts = new HashMap<>(); // Per-item discounts
    private String message; // e.g., "You saved 20% on Electronics"
    private DiscountValueType valueType;

    // Constructors
    public DiscountCalculationResult() {
    }

    public DiscountCalculationResult(BigDecimal discountAmount, String discountName, Discount appliedDiscount) {
        this.discountAmount = discountAmount;
        this.discountName = discountName;
        this.appliedDiscount = appliedDiscount;
    }

    public DiscountCalculationResult(BigDecimal discountAmount, String discountName,
            String discountCode, Discount appliedDiscount,
            DiscountValueType valueType, String message) {
        this.discountAmount = discountAmount;
        this.discountName = discountName;
        this.discountCode = discountCode;
        this.appliedDiscount = appliedDiscount;
        this.valueType = valueType;
        this.message = message;
    }

    // Builder pattern for easy construction
    public static class Builder {
        private BigDecimal discountAmount;
        private String discountName;
        private String discountCode;
        private Discount appliedDiscount;
        private Map<Long, BigDecimal> itemDiscounts = new HashMap<>();
        private String message;
        private DiscountValueType valueType;

        public Builder discountAmount(BigDecimal discountAmount) {
            this.discountAmount = discountAmount;
            return this;
        }

        public Builder discountName(String discountName) {
            this.discountName = discountName;
            return this;
        }

        public Builder discountCode(String discountCode) {
            this.discountCode = discountCode;
            return this;
        }

        public Builder appliedDiscount(Discount appliedDiscount) {
            this.appliedDiscount = appliedDiscount;
            return this;
        }

        public Builder itemDiscount(Long itemId, BigDecimal discount) {
            this.itemDiscounts.put(itemId, discount);
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder valueType(DiscountValueType valueType) {
            this.valueType = valueType;
            return this;
        }

        public DiscountCalculationResult build() {
            DiscountCalculationResult result = new DiscountCalculationResult();
            result.discountAmount = this.discountAmount;
            result.discountName = this.discountName;
            result.discountCode = this.discountCode;
            result.appliedDiscount = this.appliedDiscount;
            result.itemDiscounts = this.itemDiscounts;
            result.message = this.message;
            result.valueType = this.valueType;
            return result;
        }
    }

    // Getters and setters
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getDiscountName() {
        return discountName;
    }

    public void setDiscountName(String discountName) {
        this.discountName = discountName;
    }

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }

    public Discount getAppliedDiscount() {
        return appliedDiscount;
    }

    public void setAppliedDiscount(Discount appliedDiscount) {
        this.appliedDiscount = appliedDiscount;
    }

    public Map<Long, BigDecimal> getItemDiscounts() {
        return itemDiscounts;
    }

    public void setItemDiscounts(Map<Long, BigDecimal> itemDiscounts) {
        this.itemDiscounts = itemDiscounts;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public DiscountValueType getValueType() {
        return valueType;
    }

    public void setValueType(DiscountValueType valueType) {
        this.valueType = valueType;
    }
}
