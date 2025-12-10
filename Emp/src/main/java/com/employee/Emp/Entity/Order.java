package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order implements SequenceEntity {
    public static final String SEQUENCE_NAME = "orders_sequence";

    @Id
    private Long id;

    @Indexed(unique = true)
    @Field("order_number")
    private String orderNumber;

    @Field("user_id")
    private Long userId;

    @Transient
    private List<OrderItem> orderItems = new ArrayList<>();

    @Field("total_amount")
    private Double totalAmount;

    @Field("discount_amount")
    private Double discountAmount = 0.0;

    @Field("applied_coupon_code")
    private String appliedCouponCode;

    private String status = "PENDING";

    @Field("payment_status")
    private String paymentStatus = "PENDING";

    @Field("order_date")
    private LocalDateTime orderDate;

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
