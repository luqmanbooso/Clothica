package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Cart;
import com.employee.Emp.Entity.CartItem;
import com.employee.Emp.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    void deleteByCartId(Long cartId);
}
