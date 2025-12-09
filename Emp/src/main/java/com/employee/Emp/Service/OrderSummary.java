package com.employee.Emp.Service;

import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.OrderContext;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.util.List;

public class OrderSummary {
    @JsonIgnore
    private OrderContext orderContext;

    private List<DiscountCalculationResult> appliedDiscounts;
    private BigDecimal totalDiscount;
    private BigDecimal grandTotal;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal taxAmount;

    // Constructors
    public OrderSummary() {
    }

    public OrderSummary(OrderContext orderContext, List<DiscountCalculationResult> appliedDiscounts,
            BigDecimal totalDiscount, BigDecimal grandTotal) {
        this.orderContext = orderContext;
        this.appliedDiscounts = appliedDiscounts;
        this.totalDiscount = totalDiscount;
        this.grandTotal = grandTotal;
        this.subtotal = orderContext.getSubtotal();
        this.shippingCost = orderContext.getShippingCost() != null ? orderContext.getShippingCost() : BigDecimal.ZERO;
        this.taxAmount = orderContext.getTaxAmount() != null ? orderContext.getTaxAmount() : BigDecimal.ZERO;
    }

    // Getters and setters
    public OrderContext getOrderContext() {
        return orderContext;
    }

    public void setOrderContext(OrderContext orderContext) {
        this.orderContext = orderContext;
    }

    public List<DiscountCalculationResult> getAppliedDiscounts() {
        return appliedDiscounts;
    }

    public void setAppliedDiscounts(List<DiscountCalculationResult> appliedDiscounts) {
        this.appliedDiscounts = appliedDiscounts;
    }

    public BigDecimal getTotalDiscount() {
        return totalDiscount;
    }

    public void setTotalDiscount(BigDecimal totalDiscount) {
        this.totalDiscount = totalDiscount;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
}