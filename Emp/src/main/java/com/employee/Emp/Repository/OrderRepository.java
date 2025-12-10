package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserId(Long userId);
    List<Order> findByOrderDateAfter(LocalDateTime orderDateAfter);
    List<Order> findByStatusIn(List<String> statuses);
}
