package com.employee.Emp.Service;

import com.employee.Emp.Entity.Order;
import com.employee.Emp.Entity.Product;
import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Repository.OrderRepository;
import com.employee.Emp.Repository.ProductRepository;
import com.employee.Emp.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();

        // Calculate total revenue from all orders
        Double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Calculate average order value
        Double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        overview.put("totalRevenue", totalRevenue);
        overview.put("totalOrders", totalOrders);
        overview.put("totalCustomers", totalUsers);
        overview.put("avgOrderValue", avgOrderValue);
        overview.put("totalProducts", totalProducts);

        return overview;
    }

    // Finance Data (Revenue, Expenses, Profit - simplified)
    public Map<String, Object> getFinanceData(){
        Map<String, Object> finance = new HashMap<>();
        // Get orders from last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Order> recentOrders= orderRepository.findByOrderDateAfter(thirtyDaysAgo);

        // Calculate revenue by day for last 30 days
        Map<String, Double> revenueByDay = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Double dailyRevenue = recentOrders.stream()
                    .filter(order -> order.getOrderDate().toLocalDate().equals(date))
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
            revenueByDay.put(date.toString(), dailyRevenue);
        }

        // For expenses, let's assume 30% of revenue as cost (simplified)
        Map<String, Double> expensesByDay = new LinkedHashMap<>();
        revenueByDay.forEach((date,revenue)->{
            expensesByDay.put(date,revenue*0.3);
        });

        // Calculate profit
        Map<String, Double> profitByDay = new LinkedHashMap<>();
        revenueByDay.forEach((date, revenue) -> {
            Double expense = expensesByDay.get(date);
            profitByDay.put(date, revenue - expense);
        });

        finance.put("revenue", revenueByDay.values().stream().toList());
        finance.put("expenses", expensesByDay.values().stream().toList());
        finance.put("profit", profitByDay.values().stream().toList());

        return finance;
    }

    // Inventory Overview
    public Map<String, Object> getInventoryOverview(){
        Map<String, Object> inventory = new HashMap<>();

        List<Product> allProducts = productRepository.findAll();

        List<Map<String,Object>> lowStockItems = allProducts.stream()
                .filter(p-> p.getStock() > 0 && p.getStock() <=10)
                .map(p-> {
                    Map<String,Object> item = new HashMap<>();
                    item.put("id",p.getId());
                    item.put("name",p.getName());
                    item.put("stock",p.getStock());
                    item.put("price",p.getPrice());
                    return item;
                })
                .toList();

        List<Map<String, Object>> outOfStockItems = allProducts.stream()
                .filter(p->p.getStock() == 0)
                .map(p-> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", p.getId());
                    item.put("name", p.getName());
                    item.put("price", p.getPrice());
                    return item;
                })
                .toList();

        inventory.put("totalProducts",allProducts.size());
        inventory.put("totalStockValue",allProducts.stream()
                .mapToDouble(p->p.getPrice()*p.getStock()).sum());
        inventory.put("lowStockItems",lowStockItems);
        inventory.put("outOfStockItems",outOfStockItems);
        inventory.put("lowStockCount",lowStockItems.size());
        inventory.put("outOfStockCount",outOfStockItems.size());
        return inventory;
    }

    // Analytics Data (Sales, Traffic, Conversion - simplified)
    public Map<String, Object> getAnalytics(String range,String period) {
        Map<String, Object> analytics = new HashMap<>();

        int days = "7".equals(range) ? 7 : 30; // Default to 30 days if not specifie

        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> recentOrders = orderRepository.findByOrderDateAfter(startDate);

        // Sales data by day
        Map<String, Object> sales = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Double dailySales = recentOrders.stream()
                    .filter(order -> order.getOrderDate().toLocalDate().equals(date))
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
            sales.put(date.toString(), dailySales);
        }

        // For traffic (simplified - using user registrations)
        List<UserInfo> recentUsers = userRepository.findByCreatedAtAfter(startDate);
        Map<String, Long> traffic = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long dailyTraffic = recentUsers.stream()
                    .filter(user -> user.getCreatedAt() != null &&
                            user.getCreatedAt().toLocalDate().equals(date))
                    .count();
            traffic.put(date.toString(), dailyTraffic);
        }

        // Conversion rate (simplified - orders/users)
        long totalVisitors = recentUsers.size();
        long totalOrders = recentOrders.size();
        double conversionRate = totalVisitors > 0 ? (double) totalOrders / totalVisitors * 100 : 0;

        analytics.put("sales", sales);
        analytics.put("traffic", traffic);
        analytics.put("conversion", conversionRate);
        analytics.put("range", range);
        analytics.put("period", period);

        return analytics;
    }

    // Real-time Data
    public Map<String,Object> getRealTimeData(){
        Map<String,Object> realTime = new HashMap<>();

        //Get today's orders
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        List<Order> todayOrders = orderRepository.findByOrderDateAfter(todayStart);

        //Active users (users who placed orders today)
        Set<String> activeUsers = todayOrders.stream()
                .map(order -> order.getUser().getUsername())
                .collect(Collectors.toSet());

        // Live orders (pending/processing orders)
        List<Map<String, Object>> liveOrders = orderRepository.findByStatusIn(Arrays.asList("PENDING", "PROCESSING"))
                .stream()
                .limit(10) // Limit to 10 most recent
                .map(order -> {
                    Map<String, Object> orderInfo = new HashMap<>();
                    orderInfo.put("id", order.getId());
                    orderInfo.put("orderNumber", order.getOrderNumber());
                    orderInfo.put("customer", order.getUser().getUsername());
                    orderInfo.put("amount", order.getTotalAmount());
                    orderInfo.put("status", order.getStatus());
                    orderInfo.put("time", order.getOrderDate());
                    return orderInfo;
                })
                .toList();

        realTime.put("activeUsers", activeUsers.size());
        realTime.put("liveOrders", liveOrders);
        realTime.put("todayOrders", todayOrders.size());
        realTime.put("todayRevenue", todayOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum());

        return realTime;
    }


    // Customer Intelligence
    public Map<String, Object> getCustomerIntelligence(String range, String period) {
        Map<String, Object> intelligence = new HashMap<>();

        List<UserInfo> allUsers = userRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        // Customer segments based on order frequency
        Map<String, Long> segments = new HashMap<>();
        segments.put("New Customers", allUsers.stream()
                .filter(user -> user.getCreatedAt() != null &&
                        user.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .count());

        segments.put("Repeat Customers", allUsers.stream()
                .filter(user -> {
                    long userOrderCount = allOrders.stream()
                            .filter(order -> order.getUser().getId()==user.getId())
                            .count();
                    return userOrderCount > 1;
                })
                .count());

        segments.put("VIP Customers", allUsers.stream()
                .filter(user -> {
                    double totalSpent = allOrders.stream()
                            .filter(order -> order.getUser().getId()==user.getId())
                            .mapToDouble(Order::getTotalAmount)
                            .sum();
                    return totalSpent > 1000; // VIP if spent over 1000
                })
                .count());

        // Customer behavior (most purchased products)
        Map<String, Long> topProducts = new HashMap<>();
        allOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .collect(java.util.stream.Collectors.groupingBy(
                        item -> item.getProduct().getName(),
                        java.util.stream.Collectors.summingLong(item -> item.getQuantity())
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .forEach(entry -> topProducts.put(entry.getKey(), entry.getValue()));

        intelligence.put("segments", segments);
        intelligence.put("behavior", topProducts);
        intelligence.put("totalCustomers", allUsers.size());
        intelligence.put("range", range);
        intelligence.put("period", period);

        return intelligence;
    }

    // Client Features
    public Map<String, Object> getClientFeatures() {
        Map<String, Object> features = new HashMap<>();

        // Simplified - in real app, you'd have loyalty, coupons, notifications entities
        long activeUsers = userRepository.count();

        features.put("loyalty", Map.of("activeUsers", activeUsers));
        features.put("coupons", Map.of("active", 0)); // Add your coupon logic
        features.put("notifications", Map.of("sent", 0)); // Add your notification logic

        return features;
    }

    // Helper method to convert map to list for chart data
    private List<Map<String, Object>> convertMapToList(Map<String, ?> map) {
        return map.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("date", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .toList();
    }
}
