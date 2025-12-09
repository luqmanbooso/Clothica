package com.employee.Emp.Controller;

import com.employee.Emp.Entity.Banner;
import com.employee.Emp.Entity.Event;
import com.employee.Emp.Repository.EventRepository;
import com.employee.Emp.Service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@CrossOrigin
public class AdminBannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    private EventRepository eventRepository;

    /**
     * GET /api/admin/banners - List all banners
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();

        List<Map<String, Object>> bannerDtos = banners.stream()
                .map(this::toBannerDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("banners", bannerDtos);
        response.put("total", banners.size());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/banners/{id} - Get single banner
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBannerById(@PathVariable Long id) {
        return bannerService.getBannerById(id)
                .map(banner -> ResponseEntity.ok(toBannerDTO(banner)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/admin/banners - Create new banner
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBanner(@RequestBody Map<String, Object> request) {
        Banner banner = fromBannerRequest(request);
        Banner created = bannerService.createBanner(banner);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Banner created successfully");
        response.put("banner", toBannerDTO(created));

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/banners/{id} - Update banner
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBanner(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        Banner bannerDetails = fromBannerRequest(request);
        Banner updated = bannerService.updateBanner(id, bannerDetails);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Banner updated successfully");
        response.put("banner", toBannerDTO(updated));

        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/banners/{id} - Delete banner
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBanner(@PathVariable Long id) {
        boolean deleted = bannerService.deleteBanner(id);

        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "Banner deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Banner not found");
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH /api/admin/banners/{id}/toggle - Toggle banner active status
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleBannerStatus(@PathVariable Long id) {
        Banner banner = bannerService.toggleBannerStatus(id);

        if (banner == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Banner status updated");
        response.put("isActive", banner.getIsActive());
        response.put("banner", toBannerDTO(banner));

        return ResponseEntity.ok(response);
    }

    // ========== Helper Methods ==========

    private Map<String, Object> toBannerDTO(Banner banner) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("_id", banner.getId().toString());
        dto.put("id", banner.getId());
        dto.put("name", banner.getName());
        dto.put("title", banner.getTitle());
        dto.put("subtitle", banner.getSubtitle());
        dto.put("image", banner.getImage());
        dto.put("position", banner.getPosition());
        dto.put("priority", banner.getPriority());
        dto.put("isActive", banner.getIsActive());
        dto.put("startDate", banner.getStartDate());
        dto.put("endDate", banner.getEndDate());

        // CTA object
        Map<String, Object> cta = new HashMap<>();
        cta.put("text", banner.getCtaText() != null ? banner.getCtaText() : "Shop Now");
        cta.put("link", banner.getCtaLink());
        cta.put("target", banner.getCtaTarget());
        dto.put("cta", cta);

        // Analytics object
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("displays", banner.getDisplayCount());
        analytics.put("clicks", banner.getClickCount());
        analytics.put("conversions", banner.getConversionCount());
        dto.put("analytics", analytics);

        // Event info (if associated)
        if (banner.getEvent() != null) {
            Map<String, Object> eventDto = new HashMap<>();
            eventDto.put("_id", banner.getEvent().getId().toString());
            eventDto.put("id", banner.getEvent().getId());
            eventDto.put("name", banner.getEvent().getName());
            dto.put("eventId", eventDto);
        }

        dto.put("createdAt", banner.getCreatedAt());
        dto.put("updatedAt", banner.getUpdatedAt());

        return dto;
    }

    private Banner fromBannerRequest(Map<String, Object> request) {
        Banner banner = new Banner();

        banner.setName((String) request.get("name"));
        banner.setTitle((String) request.get("title"));
        banner.setSubtitle((String) request.get("subtitle"));
        banner.setImage((String) request.get("image"));
        banner.setPosition((String) request.getOrDefault("position", "hero"));

        if (request.get("priority") != null) {
            banner.setPriority(((Number) request.get("priority")).intValue());
        }

        if (request.get("isActive") != null) {
            banner.setIsActive((Boolean) request.get("isActive"));
        }

        // Parse dates
        if (request.get("startDate") != null) {
            String startDate = (String) request.get("startDate");
            banner.setStartDate(LocalDate.parse(startDate).atStartOfDay());
        }

        if (request.get("endDate") != null && !((String) request.get("endDate")).isEmpty()) {
            String endDate = (String) request.get("endDate");
            banner.setEndDate(LocalDate.parse(endDate).atTime(23, 59, 59));
        }

        // Parse CTA
        @SuppressWarnings("unchecked")
        Map<String, Object> cta = (Map<String, Object>) request.get("cta");
        if (cta != null) {
            banner.setCtaText((String) cta.get("text"));
            banner.setCtaLink((String) cta.get("link"));
            banner.setCtaTarget((String) cta.getOrDefault("target", "_self"));
        }

        // Associate event if provided
        if (request.get("eventId") != null && !((String) request.get("eventId")).isEmpty()) {
            try {
                Long eventId = Long.parseLong((String) request.get("eventId"));
                eventRepository.findById(eventId).ifPresent(banner::setEvent);
            } catch (NumberFormatException e) {
                // Invalid event ID, ignore
            }
        }

        return banner;
    }
}
