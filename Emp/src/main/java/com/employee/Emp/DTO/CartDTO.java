package com.employee.Emp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDTO {
    private Long id;
    private Integer userId;
    private List<CartItemDTO> items;
    private Double totalAmount;
    private Integer totalItems;
}
