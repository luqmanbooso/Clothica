package com.employee.Emp.Service;

import com.employee.Emp.DTO.CartDTO;
import com.employee.Emp.DTO.CartItemDTO;
import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Repository.DiscountRepository;
import com.employee.Emp.Repository.UserRepository;
import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.DiscountItem;
import com.employee.Emp.filter.OrderContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DiscountService {

    @Autowired
    private DiscountEngine discountEngine;

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartService cartService;

    public ResponseEntity<DiscountValidationResponse> validateCoupon(CouponValidationRequest request) {
        Optional<Discount> discountOpt = discountRepository.findByCode(request.getCouponCode()).stream().findFirst();

        if (!discountOpt.isPresent()) {
            return ResponseEntity.badRequest().body(
                    new DiscountValidationResponse(false, "Invalid coupon code"));
        }

        Discount discount = discountOpt.get();

        // Check if discount is active
        if (discount.getIsActive() == null || !discount.getIsActive()) {
            return ResponseEntity.badRequest().body(
                    new DiscountValidationResponse(false, "Coupon is not active"));
        }

        Optional<UserInfo> customerOpt = userRepository.findById(request.getCustomerId());

        if (!customerOpt.isPresent()) {
            return ResponseEntity.badRequest().body(
                    new DiscountValidationResponse(false, "Invalid customer"));
        }

        // Create minimal order context for validation
        OrderContext context = new OrderContext();
        context.setCustomer(customerOpt.get());
        context.setOrderTime(LocalDateTime.now());
        context.setCouponCode(request.getCouponCode());

        // For validation, we might need cart data
        if (request.getUserId() != null) {
            // Load cart items to create proper context
            CartDTO cartDto = cartService.getCartByUserId(request.getUserId());
            if (cartDto != null) {
                // Convert DTO to discount items
                context.setItems(convertCartItemsFromDTO(cartDto.getItems()));
                context.setSubtotal(BigDecimal.valueOf(cartDto.getTotalAmount()));
            }
        }

        // Validate the discount
        boolean isValid = discountEngine.validateDiscount(discount, context);

        if (isValid) {
            DiscountCalculationResult preview = discount.calculateDiscount(context);
            return ResponseEntity.ok(new DiscountValidationResponse(true, "Coupon is valid", discount, preview));
        } else {
            return ResponseEntity.badRequest().body(
                    new DiscountValidationResponse(false, "Coupon is not applicable"));
        }
    }

    public ResponseEntity<OrderSummary> applyDiscountsToCart(ApplyDiscountRequest request) {
        // Validate customer
        Optional<UserInfo> customerOpt = userRepository.findById(request.getCustomerId());
        if (!customerOpt.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        OrderContext context = createOrderContext(request);
        if (context == null) {
            return ResponseEntity.badRequest().build();
        }

        List<DiscountCalculationResult> discounts = discountEngine.applyDiscounts(context);

        OrderSummary summary = calculateOrderSummary(context, discounts);

        // Only increment usage for discounts that were actually applied (positive
        // amount)
        discounts.stream()
                .filter(d -> d.getAppliedDiscount() != null &&
                        d.getDiscountAmount() != null &&
                        d.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0)
                .forEach(d -> incrementUsage(d.getAppliedDiscount()));

        return ResponseEntity.ok(summary);
    }

    public ResponseEntity<List<Discount>> getAvailableDiscounts(Long customerId) {
        Optional<UserInfo> customerOpt = userRepository.findById(customerId);
        if (!customerOpt.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        List<Discount> availableDiscounts = discountRepository.findActiveDiscounts(LocalDateTime.now());
        // Filter based on customer eligibility - simplified for now
        return ResponseEntity.ok(availableDiscounts);
    }

    private OrderContext createOrderContext(ApplyDiscountRequest request) {
        Optional<UserInfo> customerOpt = userRepository.findById(request.getCustomerId());
        CartDTO cartDto = cartService.getCartByUserId(request.getUserId());

        // Null check for cart
        if (cartDto == null || cartDto.getItems() == null) {
            return null;
        }

        OrderContext context = new OrderContext();
        context.setCustomer(customerOpt.orElse(null));
        // Convert CartItemDTO to DiscountItem (fix type mismatch)
        context.setItems(convertCartItemsFromDTO(cartDto.getItems()));
        context.setSubtotal(BigDecimal.valueOf(cartDto.getTotalAmount()));
        context.setShippingCost(BigDecimal.ZERO); // Would need shipping calculation
        context.setTaxAmount(BigDecimal.ZERO); // Would need tax calculation
        context.setOrderTime(LocalDateTime.now());
        if (request.getCouponCodes() != null && !request.getCouponCodes().isEmpty()) {
            context.setCouponCode(request.getCouponCodes().get(0)); // For simplicity, take first
        }

        return context;
    }

    private List<DiscountItem> convertCartItemsFromDTO(List<CartItemDTO> cartItemDTOs) {
        List<DiscountItem> discountItems = new ArrayList<>();
        for (CartItemDTO dto : cartItemDTOs) {
            DiscountItem item = new DiscountItem();
            item.setProductId(dto.getProductId());
            item.setProductName(dto.getProductName());
            item.setPrice(BigDecimal.valueOf(dto.getProductPrice()));
            item.setQuantity(dto.getQuantity());
            // categoryId would need to be fetched from product repository
            // For now, set to null
            item.setCategoryId(null);
            discountItems.add(item);
        }
        return discountItems;
    }

    private void incrementUsage(Discount discount) {
        discount.setUsesCount(discount.getUsesCount() + 1);
        discountRepository.save(discount);
    }

    private OrderSummary calculateOrderSummary(OrderContext context,
            List<DiscountCalculationResult> discounts) {
        BigDecimal totalDiscount = discounts.stream()
                .map(DiscountCalculationResult::getDiscountAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cartTotal = context.getSubtotal()
                .add(context.getShippingCost() != null ? context.getShippingCost() : BigDecimal.ZERO)
                .add(context.getTaxAmount() != null ? context.getTaxAmount() : BigDecimal.ZERO);

        // Ensure discount doesn't exceed the total cart value (prevent negative grand
        // total)
        if (totalDiscount.compareTo(cartTotal) > 0) {
            totalDiscount = cartTotal;
        }

        BigDecimal grandTotal = cartTotal.subtract(totalDiscount);

        // Extra safety check to ensure non-negative grand total
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }

        return new OrderSummary(context, discounts, totalDiscount, grandTotal);
    }
}
