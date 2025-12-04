package com.employee.Emp.Controller;

import com.employee.Emp.DTO.OrderDTO;
import com.employee.Emp.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {
    @Autowired
    private OrderService orderService;

    // Create order from cart
    @PostMapping("/create/{userId}")
    public ResponseEntity<OrderDTO> createOrder(@PathVariable Integer userId) {
        OrderDTO order = orderService.createOrder(userId);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long orderId) {
        OrderDTO order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    // Get order by order number
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDTO> getOrderByNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    // Get all orders for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO>> getUserOrders(@PathVariable Integer userId) {
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    // Update order status (admin only)
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        OrderDTO order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }
}
