package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "order_items")
public class OrderItem implements SequenceEntity {
    public static final String SEQUENCE_NAME = "order_items_sequence";

    @Id
    private Long id;

    @Field("order_id")
    private Long orderId;

    @Field("product_id")
    private Long productId;

    private Integer quantity;
    private Double price;

    @Transient
    private Product product;

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
