package com.employee.Emp.Repository;


import com.employee.Emp.Entity.Cart;
import com.employee.Emp.Entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByUser(UserInfo user);
    Optional<Cart> findByUserId(int userId);
}
