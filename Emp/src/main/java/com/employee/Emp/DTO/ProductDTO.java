package com.employee.Emp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private Long _id; // convenience for frontend keys
    private String name;
    private String description;
    private double price;
    private int stock;

    private String image;
    private String category;
    private String subcategory;
    private String brand;
    private Integer discount;
    private Double rating;
    private Boolean isNew;
    private java.time.LocalDateTime createdAt;
    private java.util.List<String> images;
}
