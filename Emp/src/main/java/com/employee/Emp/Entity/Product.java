package com.employee.Emp.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double price;
    private int stock;

    // Optional storefront metadata
    private String image;            // primary image URL
    private String category;
    private String subcategory;
    private String brand;
    private Integer discount;        // percentage off, 0-100
    private Double rating;           // average rating
    private Boolean isNew;
    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private java.util.List<String> images;
}
