package com.employee.Emp.Controller;

import com.employee.Emp.Service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@CrossOrigin
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService dashboardService;

    // 1. Overview Cards (Total Revenue, Orders, Customers, etc.)
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(dashboardService.getOverview());
    }

    // 2. Finance Chart (Revenue, Expenses, Profit - last 30 days)
    @GetMapping("/finance")
    public ResponseEntity<Map<String, Object>> getFinanceData() {
        return ResponseEntity.ok(dashboardService.getFinanceData());
    }

    // 3. Inventory Overview + Low Stock Alerts
    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryOverview() {
        return ResponseEntity.ok(dashboardService.getInventoryOverview());
    }

    // 4. Analytics (Sales + Traffic + Conversion Rate)
    // Example: /api/admin/dashboard/analytics?range=7   or ?range=30
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestParam(defaultValue = "30") String range,
            @RequestParam(defaultValue = "daily") String period) {

        return ResponseEntity.ok(dashboardService.getAnalytics(range, period));
    }

    @GetMapping("/real-time")
    public ResponseEntity<Map<String, Object>> getRealTime(){
        return ResponseEntity.ok(dashboardService.getRealTimeData());
    }

    @GetMapping("/customer-intelligence")
    public ResponseEntity<Map<String,Object>> getCustomerIntelligence(
            @RequestParam(required = false,defaultValue = "30") String range,
            @RequestParam(required = false,defaultValue = "month") String period
    ){
        return ResponseEntity.ok(dashboardService.getCustomerIntelligence(range, period));
    }

    @GetMapping("/client-features")
    public ResponseEntity<Map<String,Object>> getClientFeatures(){
        return ResponseEntity.ok(dashboardService.getClientFeatures());
    }

}
