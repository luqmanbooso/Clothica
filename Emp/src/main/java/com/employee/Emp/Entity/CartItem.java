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
@Document(collection = "cart_items")
public class CartItem implements SequenceEntity {
    public static final String SEQUENCE_NAME = "cart_items_sequence";

    @Id
    private Long id;

    @Field("cart_id")
    private Long cartId;

    @Field("product_id")
    private Long productId;

    private Integer quantity;

    @Transient
    private Product product;

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
