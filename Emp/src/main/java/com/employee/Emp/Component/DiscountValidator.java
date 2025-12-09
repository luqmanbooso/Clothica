package com.employee.Emp.Component;

import com.employee.Emp.Entity.BulkDiscount;
import com.employee.Emp.Entity.Coupon;
import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.filter.DiscountItem;
import com.employee.Emp.filter.OrderContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DiscountValidator {
    public boolean isValid(Discount discount, OrderContext context) {
        // Check date validity
        if (!isWithinDateRange(discount, context.getOrderTime())) {
            return false;
        }

        // Check usage limits
        if (!checkUsageLimits(discount, context.getCustomer())) {
            return false;
        }

        // Check minimum cart value
        if (!meetsMinimumCartValue(discount, context)) {
            return false;
        }

        // Check customer eligibility
        if (!isCustomerEligible(discount, context.getCustomer())) {
            return false;
        }

        // Check product/category exclusions
        if (hasExcludedItems(discount, context.getItems())) {
            return false;
        }

        // Check specific conditions based on discount type
        return checkSpecificConditions(discount, context);
    }

    private boolean isWithinDateRange(Discount discount, LocalDateTime orderTime) {
        LocalDateTime start = discount.getStartDate();
        LocalDateTime end = discount.getEndDate();

        if (start != null && orderTime.isBefore(start)) {
            return false;
        }
        if (end != null && orderTime.isAfter(end)) {
            return false;
        }
        return true;
    }

    private boolean checkUsageLimits(Discount discount, UserInfo customer) {
        // Check global usage limit
        if (discount.getMaxUses() != null && discount.getUsesCount() >= discount.getMaxUses()) {
            return false;
        }

        // Check per-customer usage limit (would need customer usage tracking)
        // For now, assume no per-customer tracking implemented
        if (discount.getMaxUsesPerCustomer() != null) {
            // This would require a separate table for customer-discount usage
            // For simplicity, return true
            return true;
        }

        return true;
    }

    private boolean meetsMinimumCartValue(Discount discount, OrderContext context) {
        if (discount.getMinimumCartValue() == null) {
            return true;
        }
        if (context.getSubtotal() == null) {
            return false;
        }
        return context.getSubtotal().compareTo(discount.getMinimumCartValue()) >= 0;
    }

    private boolean isCustomerEligible(Discount discount, UserInfo customer) {
        if (customer == null)
            return false;

        // Check if discount is for specific customer (personalized coupons)
        if (discount instanceof Coupon) {
            Coupon coupon = (Coupon) discount;
            if (coupon.getCustomerEmail() != null &&
                    !coupon.getCustomerEmail().equals(customer.getEmail())) {
                return false;
            }
            if (coupon.getIsFirstOrderOnly() != null && coupon.getIsFirstOrderOnly()) {
                // Check if customer has previous orders
                // This would require order repository check
                // For now, assume eligible
                return true;
            }
        }

        return true;
    }

    private boolean hasExcludedItems(Discount discount, List<DiscountItem> items) {
        if (items == null || items.isEmpty()) {
            return false;
        }

        for (DiscountItem item : items) {
            // Check excluded products
            if (discount.getExcludedProducts() != null &&
                    discount.getExcludedProducts().stream().anyMatch(p -> p.getId().equals(item.getProductId()))) {
                return true;
            }
            // Check excluded categories
            if (item.getCategoryId() != null && discount.getExcludedCategories() != null &&
                    discount.getExcludedCategories().stream().anyMatch(c -> c.getId().equals(item.getCategoryId()))) {
                return true;
            }
        }
        return false;
    }

    private boolean checkSpecificConditions(Discount discount, OrderContext context) {
        // Additional type-specific validation can be added here
        if (discount instanceof BulkDiscount) {
            BulkDiscount bulkDiscount = (BulkDiscount) discount;
            int totalQuantity = (bulkDiscount.getProductId() != null)
                    ? context.getProductQuantity(bulkDiscount.getProductId())
                    : context.getItems().stream().mapToInt(DiscountItem::getQuantity).sum();
            return totalQuantity >= bulkDiscount.getMinimumQuantity();
        }

        return true;
    }
}
