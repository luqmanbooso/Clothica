package com.employee.Emp.Repository;

import com.employee.Emp.Entity.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderItemRepository extends MongoRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
}
