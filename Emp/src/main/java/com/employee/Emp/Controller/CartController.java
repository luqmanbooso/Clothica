package com.employee.Emp.Controller;

import com.employee.Emp.DTO.CartDTO;
import com.employee.Emp.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class CartController {
    @Autowired
    private CartService cartService;

    // Get user's cart
    // When user first accesses cart, it's created automatically
//    System checks if user has a cart
//    If not, creates a new cart: createCartForUser(userId)
//    Returns empty cart or existing cart with items
    @GetMapping("/user/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Integer userId){
        CartDTO cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    // Add item to cart
    @PostMapping("/user/{userId}/add/{productId}")
    public ResponseEntity<CartDTO> addToCart(
            @PathVariable Integer userId,
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        CartDTO cart = cartService.addToCart(userId, productId, quantity);
        return new ResponseEntity<>(cart, HttpStatus.CREATED);
    }

    // Update cart item quantity
    @PutMapping("/user/{userId}/update/{productId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable Integer userId,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        CartDTO cart = cartService.updateCartItem(userId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    // Remove item from cart
    @DeleteMapping("/user/{userId}/remove/{productId}")
    public ResponseEntity<CartDTO> removeFromCart(
            @PathVariable Integer userId,
            @PathVariable Long productId) {

        CartDTO cart = cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok(cart);
    }

    // Clear entire cart
    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Integer userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
