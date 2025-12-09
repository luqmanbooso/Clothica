package com.employee.Emp.filter;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Entity.UserInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderContext {
    @JsonIgnore
    private UserInfo customer;

    private List<DiscountItem> items;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal taxAmount;

    @Builder.Default
    @JsonIgnore
    private List<Discount> appliedDiscounts = new ArrayList<>();

    private String couponCode;
    private LocalDateTime orderTime;

    // Business logic methods
    public boolean meetsMinimumCartValue(BigDecimal minimum) {
        return subtotal.compareTo(minimum) >= 0;
    }

    public int getProductQuantity(Long productId) {
        if (items == null)
            return 0;

        return items.stream()
                .filter(item -> item.getProductId().equals(productId))
                .mapToInt(DiscountItem::getQuantity)
                .sum();
    }

    public BigDecimal getCartTotal() {
        BigDecimal shipping = shippingCost != null ? shippingCost : BigDecimal.ZERO;
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        return subtotal.add(shipping).add(tax);
    }

    public boolean containsCategory(String category) {
        if (items == null)
            return false;

        return items.stream()
                .anyMatch(item -> category.equals(item.getCategoryId()));
    }

    public BigDecimal getCategorySubtotal(String category) {
        if (items == null)
            return BigDecimal.ZERO;

        return items.stream()
                .filter(item -> category.equals(item.getCategoryId()))
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}