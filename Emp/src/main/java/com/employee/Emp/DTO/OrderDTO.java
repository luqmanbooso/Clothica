package com.employee.Emp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private List<OrderItemDTO> orderItems;
    private Double totalAmount;
    private Double discountAmount;
    private String appliedCouponCode;
    private String status;
    private String paymentStatus;
    private LocalDateTime orderDate;
}
