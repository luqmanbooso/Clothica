package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Order;
import com.employee.Emp.Entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(UserInfo user);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserId(Integer userId);
}
