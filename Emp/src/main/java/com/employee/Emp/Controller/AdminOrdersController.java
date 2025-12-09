package com.employee.Emp.Controller;

import com.employee.Emp.DTO.OrderDTO;
import com.employee.Emp.Service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin
@RequiredArgsConstructor
public class AdminOrdersController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderDTO> list() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public OrderDTO get(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<OrderDTO> fulfill(@PathVariable Long id) {
        OrderDTO updated = orderService.fulfillOrder(id);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> invoice(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        // Simple placeholder PDF content; enough for the frontend download flow
        String content = "Invoice placeholder for order " +
                (order.getOrderNumber() != null ? order.getOrderNumber() : id);
        byte[] data = content.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("invoice-" + id + ".pdf")
                .build());

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
