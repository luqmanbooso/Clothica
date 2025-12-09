package com.employee.Emp.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin
public class InventoryController {

    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String,Object>>> getAlerts() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}
