package com.employee.Emp.Service;

import com.employee.Emp.DTO.CartDTO;
import com.employee.Emp.DTO.CartItemDTO;
import com.employee.Emp.Entity.Cart;
import com.employee.Emp.Entity.CartItem;
import com.employee.Emp.Entity.Product;
import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Repository.CartItemRepository;
import com.employee.Emp.Repository.CartRepository;
import com.employee.Emp.Repository.ProductRepository;
import com.employee.Emp.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public CartDTO getCartByUserId(Integer userId){
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(()-> createCartForUser(userId));
        return convertToDTO(cart);
    }

    public CartDTO addToCart(Integer userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        // 1. Get or create user's cart
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        // 2. Check product exists and has stock
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check stock
        if (product.getStock() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }
        // 3. Check if item already in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem.isPresent()) {
            // 4. If exists, increase quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // 5. If new, create cart item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
        }
        // 6. Recalculate cart total
        cart.calculateTotal();
        cartRepository.save(cart);

        return convertToDTO(cart);
    }

    public CartDTO updateCartItem(Integer userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                    .orElseThrow(() -> new RuntimeException("Item not found in cart"));
            cartItemRepository.delete(item);
        } else {
            // Check stock
            if (product.getStock() < quantity) {
                throw new RuntimeException("Not enough stock available");
            }

            CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                    .orElseThrow(() -> new RuntimeException("Item not found in cart"));

            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cart.calculateTotal();
        cartRepository.save(cart);

        return convertToDTO(cart);
    }

    public CartDTO removeFromCart(Integer userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Optional<CartItem> itemToRemove = cart.getItems().stream()
                .filter(item->item.getProduct().getId().equals(productId))
                        .findFirst();

        if (itemToRemove.isEmpty()){
            throw new RuntimeException("Item not found in cart");
        }

        cart.getItems().remove(itemToRemove.get());

        cart.calculateTotal();

        Cart updatedCart = cartRepository.save(cart);
        return convertToDTO(updatedCart);
    }

    public void clearCart(Integer userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cart.setTotalAmount(0.0);
        cartRepository.save(cart);
    }

    private Cart createCartForUser(Integer userId) {
        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();
        cartDTO.setId(cart.getId());
        cartDTO.setUserId(cart.getUser().getId());
        cartDTO.setTotalAmount(cart.getTotalAmount());
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setId(item.getId());
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getName());
                    dto.setProductPrice(item.getProduct().getPrice());
                    dto.setQuantity(item.getQuantity());
                    dto.setItemTotal(item.getQuantity() * item.getProduct().getPrice());
                    return dto;
                })
                .toList();

        cartDTO.setItems(itemDTOs);
        cartDTO.setTotalItems(itemDTOs.size());

        return cartDTO;
    }
}
