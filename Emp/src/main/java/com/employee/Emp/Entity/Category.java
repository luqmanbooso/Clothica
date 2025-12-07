package com.employee.Emp.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 512)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;
    private Integer sortOrder;

    @Column(name = "parent_id")
    private Long parentId; // optional parent category

    // Optional image URL
    private String image;
}