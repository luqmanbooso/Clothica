package com.employee.Emp.Entity;

import com.employee.Emp.Enum.DiscountValueType;
import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.OrderContext;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("BULK_DISCOUNT")
public class BulkDiscount extends Discount {
    private Integer minimumQuantity;
    private Long productId; // For product-specific bulk discounts

    @Override
    public DiscountCalculationResult calculateDiscount(OrderContext context) {
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Check if minimum quantity is met
        int totalQuantity = (productId != null) ? context.getProductQuantity(productId)
                : context.getItems().stream().mapToInt(item -> item.getQuantity()).sum();

        if (totalQuantity >= minimumQuantity) {
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
        }

        return new DiscountCalculationResult.Builder()
                .discountAmount(discountAmount)
                .discountName(getName())
                .appliedDiscount(this)
                .valueType(getValueType())
                .message(totalQuantity >= minimumQuantity ? "Bulk discount applied: " + getName()
                        : "Minimum quantity not met for bulk discount")
                .build();
    }

    // Getters and setters
    public Integer getMinimumQuantity() {
        return minimumQuantity;
    }

    public void setMinimumQuantity(Integer minimumQuantity) {
        this.minimumQuantity = minimumQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}