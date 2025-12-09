package com.employee.Emp.Controller;

import com.employee.Emp.Entity.Banner;
import com.employee.Emp.Service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin
public class BannerController {

    @Autowired
    private BannerService bannerService;

    /**
     * GET /api/banners/active - Get active banners for display
     * Query params: page, position, userType, device, eventId
     */
    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveBanners(
            @RequestParam(required = false) String page,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String userType,
            @RequestParam(required = false) String device,
            @RequestParam(required = false) Long eventId) {
        List<Banner> banners;

        if (eventId != null) {
            banners = bannerService.getActiveBannersByEvent(eventId);
        } else if (position != null && !position.isEmpty()) {
            banners = bannerService.getActiveBannersByPosition(position);
        } else {
            banners = bannerService.getActiveBanners();
        }

        List<Map<String, Object>> response = banners.stream()
                .map(this::toBannerDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/banners/{id}/display - Track banner display
     */
    @PostMapping("/{id}/display")
    public ResponseEntity<Map<String, Object>> trackDisplay(@PathVariable Long id) {
        bannerService.incrementDisplayCount(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/banners/{id}/click - Track banner click
     */
    @PostMapping("/{id}/click")
    public ResponseEntity<Map<String, Object>> trackClick(@PathVariable Long id) {
        bannerService.incrementClickCount(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/banners/{id}/conversion - Track banner conversion
     */
    @PostMapping("/{id}/conversion")
    public ResponseEntity<Map<String, Object>> trackConversion(@PathVariable Long id) {
        bannerService.incrementConversionCount(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
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
        dto.put("order", banner.getPriority()); // For frontend sorting

        // CTA object
        if (banner.getCtaText() != null || banner.getCtaLink() != null) {
            Map<String, Object> cta = new HashMap<>();
            cta.put("text", banner.getCtaText() != null ? banner.getCtaText() : "Shop Now");
            cta.put("link", banner.getCtaLink());
            cta.put("target", banner.getCtaTarget() != null ? banner.getCtaTarget() : "_self");
            dto.put("cta", cta);
        }

        // Event info (if associated)
        if (banner.getEvent() != null) {
            Map<String, Object> eventDto = new HashMap<>();
            eventDto.put("_id", banner.getEvent().getId().toString());
            eventDto.put("id", banner.getEvent().getId());
            eventDto.put("name", banner.getEvent().getName());
            dto.put("eventId", eventDto);
        }

        return dto;
    }
}
