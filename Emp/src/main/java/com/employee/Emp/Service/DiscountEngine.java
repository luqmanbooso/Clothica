package com.employee.Emp.Service;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Repository.DiscountRepository;
import com.employee.Emp.Component.DiscountValidator;
import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.OrderContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscountEngine {
    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private DiscountValidator discountValidator;

    public boolean validateDiscount(Discount discount, OrderContext context) {
        return discountValidator.isValid(discount, context);
    }

    public List<DiscountCalculationResult> applyDiscounts(OrderContext context) {
        List<Discount> applicableDiscounts = findApplicableDiscounts(context);
        List<DiscountCalculationResult> results = new ArrayList<>();

        // Apply exclusive discounts first
        applicableDiscounts.stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsExclusive()))
                .forEach(discount -> {
                    results.add(discount.calculateDiscount(context));
                });

        if (!results.isEmpty()) {
            return results; // Exclusive discount applied, skip others
        }

        // Apply stackable discounts
        applicableDiscounts.stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsStackable()) || results.isEmpty())
                .forEach(discount -> {
                    results.add(discount.calculateDiscount(context));
                });

        return results;
    }

    private List<Discount> findApplicableDiscounts(OrderContext context) {
        return discountRepository.findActiveDiscounts(LocalDateTime.now()).stream()
                .filter(d -> discountValidator.isValid(d, context))
                .sorted(Comparator.comparing((Discount d) -> Boolean.TRUE.equals(d.getIsExclusive())).reversed()
                        .thenComparing(Discount::getDiscountValue, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
}
