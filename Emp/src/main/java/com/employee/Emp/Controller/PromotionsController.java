package com.employee.Emp.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin
public class PromotionsController {

    @GetMapping("/banners/{position}")
    public ResponseEntity<Map<String, Object>> getPromotionalBanners(
            @PathVariable String position,
            @RequestParam(required = false) String page,
            @RequestParam(required = false) String userTier
    ){
        // Minimal stub structure matching frontend expectations
        return ResponseEntity.ok(Map.of(
                "data", Map.of(
                        "banners", Collections.emptyList()
                )
        ));
    }
}
