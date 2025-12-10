package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product implements SequenceEntity {
    public static final String SEQUENCE_NAME = "products_sequence";

    @Id
    private Long id;

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

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    private List<String> images = new ArrayList<>();

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
