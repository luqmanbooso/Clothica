package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "carts")
public class Cart implements SequenceEntity {
    public static final String SEQUENCE_NAME = "carts_sequence";

    @Id
    private Long id;

    @Field("user_id")
    private Long userId;

    @Field("total_amount")
    private double totalAmount = 0.0;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Transient
    private List<CartItem> items = new ArrayList<>();

    public void calculateTotal() {
        totalAmount = items.stream()
                .filter(item -> item.getProduct() != null)
                .mapToDouble(item -> item.getQuantity() * item.getProduct().getPrice())
                .sum();
    }

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
