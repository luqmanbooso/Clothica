package com.employee.Emp.Controller;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @PostMapping("/validate")
    public ResponseEntity<DiscountValidationResponse> validateCoupon(
            @RequestBody CouponValidationRequest request) {
        return discountService.validateCoupon(request);
    }

    @PostMapping("/apply")
    public ResponseEntity<OrderSummary> applyDiscounts(
            @RequestBody ApplyDiscountRequest request) {
        return discountService.applyDiscountsToCart(request);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Discount>> getAvailableDiscounts(@RequestParam Long customerId) {
        return discountService.getAvailableDiscounts(customerId);
    }
}
