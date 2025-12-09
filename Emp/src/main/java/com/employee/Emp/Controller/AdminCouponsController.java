package com.employee.Emp.Controller;

import com.employee.Emp.Entity.Coupon;
import com.employee.Emp.Enum.DiscountValueType;
import com.employee.Emp.Repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@CrossOrigin
public class AdminCouponsController {

    @Autowired
    private CouponRepository couponRepository;

    /**
     * GET /api/admin/coupons - List all coupons
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();

        List<Map<String, Object>> couponDtos = coupons.stream()
                .map(this::toCouponDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(couponDtos);
    }

    /**
     * GET /api/admin/coupons/{id} - Get single coupon
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCouponById(@PathVariable Long id) {
        return couponRepository.findById(id)
                .map(coupon -> ResponseEntity.ok(toCouponDTO(coupon)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/admin/coupons - Create new coupon
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCoupon(@RequestBody Map<String, Object> request) {
        Coupon coupon = fromCouponRequest(request);
        Coupon saved = couponRepository.save(coupon);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Coupon created successfully");
        response.put("coupon", toCouponDTO(saved));

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/coupons/{id} - Update coupon
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCoupon(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        return couponRepository.findById(id)
                .map(existing -> {
                    updateCouponFromRequest(existing, request);
                    Coupon saved = couponRepository.save(existing);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Coupon updated successfully");
                    response.put("coupon", toCouponDTO(saved));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/admin/coupons/{id} - Delete coupon
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCoupon(@PathVariable Long id) {
        if (!couponRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        couponRepository.deleteById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Coupon deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/coupons/bulk-action - Bulk actions on coupons
     */
    @PostMapping("/bulk-action")
    public ResponseEntity<Map<String, Object>> bulkAction(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> couponIds = (List<String>) request.get("couponIds");
        String action = (String) request.get("action");

        if (couponIds == null || action == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid request");
            return ResponseEntity.badRequest().body(response);
        }

        int affected = 0;
        for (String idStr : couponIds) {
            try {
                Long cid = Long.parseLong(idStr);
                couponRepository.findById(cid).ifPresent(coupon -> {
                    switch (action.toLowerCase()) {
                        case "activate":
                            coupon.setIsActive(true);
                            couponRepository.save(coupon);
                            break;
                        case "deactivate":
                            coupon.setIsActive(false);
                            couponRepository.save(coupon);
                            break;
                        case "delete":
                            couponRepository.delete(coupon);
                            break;
                    }
                });
                affected++;
            } catch (NumberFormatException e) {
                // Skip invalid IDs
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", action + " completed for " + affected + " coupons");
        response.put("affectedCount", affected);
        return ResponseEntity.ok(response);
    }

    // ========== Helper Methods ==========

    private Map<String, Object> toCouponDTO(Coupon coupon) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("_id", coupon.getId().toString());
        dto.put("id", coupon.getId());
        dto.put("code", coupon.getCode());
        dto.put("name", coupon.getCode()); // Use code as name if no separate name field
        dto.put("description", coupon.getDescription() != null ? coupon.getDescription() : "");
        dto.put("type", mapDiscountType(coupon.getValueType())); // Fix: getDiscountType() is likely getValueType()
        dto.put("value", coupon.getDiscountValue());
        dto.put("minimumOrderAmount", coupon.getMinimumCartValue()); // Fix: getMinimumCartValue()
        dto.put("maxDiscount", coupon.getMaximumDiscountAmount());
        dto.put("usageLimit", coupon.getMaxUses());
        dto.put("usedCount", coupon.getUsesCount() != null ? coupon.getUsesCount() : 0);
        dto.put("userUsageLimit", coupon.getMaxUsesPerCustomer());
        dto.put("isActive", coupon.getIsActive()); // Fix: getIsActive()
        dto.put("validFrom", coupon.getStartDate() != null ? coupon.getStartDate().toLocalDate().toString() : "");
        dto.put("validUntil", coupon.getEndDate() != null ? coupon.getEndDate().toLocalDate().toString() : "");
        dto.put("isSpecialEvent", false);
        dto.put("eventType", "");
        dto.put("applicableCategories", List.of());
        dto.put("applicableProducts", List.of());
        dto.put("userGroups", List.of("all"));
        dto.put("autoGenerate", false);

        return dto;
    }

    private String mapDiscountType(DiscountValueType backendType) {
        if (backendType == null)
            return "percentage";
        switch (backendType) {
            case PERCENTAGE:
                return "percentage";
            case FIXED_AMOUNT:
                return "fixed";
            default:
                return "percentage";
        }
    }

    private DiscountValueType mapFrontendType(String frontendType) {
        if (frontendType == null)
            return DiscountValueType.PERCENTAGE;
        switch (frontendType.toLowerCase()) {
            case "percentage":
                return DiscountValueType.PERCENTAGE;
            case "fixed":
            case "fixed_amount":
                return DiscountValueType.FIXED_AMOUNT;
            case "free_shipping":
                // Assuming you don't have FREE_SHIPPING in DiscountValueType yet, or map it to
                // FIXED with logic
                return DiscountValueType.FIXED_AMOUNT;
            default:
                return DiscountValueType.PERCENTAGE;
        }
    }

    private Coupon fromCouponRequest(Map<String, Object> request) {
        Coupon coupon = new Coupon();
        updateCouponFromRequest(coupon, request);
        return coupon;
    }

    private void updateCouponFromRequest(Coupon coupon, Map<String, Object> request) {
        if (request.get("code") != null) {
            coupon.setCode(((String) request.get("code")).toUpperCase());
            // Also set couponCode field if it exists specifically in Coupon
            coupon.setCouponCode(((String) request.get("code")).toUpperCase());
        }

        if (request.get("description") != null) {
            coupon.setDescription((String) request.get("description"));
        } else if (request.get("name") != null) {
            coupon.setName((String) request.get("name")); // Use name field if available
            if (coupon.getDescription() == null) {
                coupon.setDescription((String) request.get("name"));
            }
        }

        if (request.get("type") != null) {
            coupon.setValueType(mapFrontendType((String) request.get("type")));
        }

        if (request.get("value") != null) {
            coupon.setDiscountValue(BigDecimal.valueOf(((Number) request.get("value")).doubleValue()));
        }

        if (request.get("minimumOrderAmount") != null) {
            coupon.setMinimumCartValue(BigDecimal.valueOf(((Number) request.get("minimumOrderAmount")).doubleValue()));
        }

        if (request.get("maxDiscount") != null) {
            coupon.setMaximumDiscountAmount(BigDecimal.valueOf(((Number) request.get("maxDiscount")).doubleValue()));
        }

        if (request.get("usageLimit") != null) {
            coupon.setMaxUses(((Number) request.get("usageLimit")).intValue());
        }

        if (request.get("userUsageLimit") != null) {
            coupon.setMaxUsesPerCustomer(((Number) request.get("userUsageLimit")).intValue());
        }

        if (request.get("isActive") != null) {
            coupon.setIsActive((Boolean) request.get("isActive"));
        }

        if (request.get("validFrom") != null && !((String) request.get("validFrom")).isEmpty()) {
            coupon.setStartDate(LocalDate.parse((String) request.get("validFrom")).atStartOfDay());
        }

        if (request.get("validUntil") != null && !((String) request.get("validUntil")).isEmpty()) {
            coupon.setEndDate(LocalDate.parse((String) request.get("validUntil")).atTime(23, 59, 59));
        }
    }
}
