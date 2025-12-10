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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public CartDTO getCartByUserId(Long userId) {
        Cart cart = ensureCartWithItems(userId);
        return convertToDTO(cart);
    }

    public CartDTO addToCart(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        Cart cart = ensureCartWithItems(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStock() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        CartItem cartItem;

        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCartId(cart.getId());
            cartItem.setProductId(productId);
            cartItem.setQuantity(quantity);
        }
        cartItem.setProduct(product);
        cartItemRepository.save(cartItem);

        loadCartItems(cart);
        cart.calculateTotal();
        cartRepository.save(cart);
        return convertToDTO(cart);
    }

    public CartDTO updateCartItem(Long userId, Long productId, Integer quantity) {
        Cart cart = ensureCartWithItems(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> itemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (itemOpt.isEmpty()) {
            throw new RuntimeException("Item not found in cart");
        }

        CartItem item = itemOpt.get();
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (product.getStock() < quantity) {
                throw new RuntimeException("Not enough stock available");
            }
            item.setQuantity(quantity);
            item.setProduct(product);
            cartItemRepository.save(item);
        }

        loadCartItems(cart);
        cart.calculateTotal();
        cartRepository.save(cart);
        return convertToDTO(cart);
    }

    public CartDTO removeFromCart(Long userId, Long productId) {
        Cart cart = ensureCartWithItems(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cartItemRepository.delete(item);
        loadCartItems(cart);
        cart.calculateTotal();
        cartRepository.save(cart);
        return convertToDTO(cart);
    }

    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setItems(new ArrayList<>());
        cart.setTotalAmount(0.0);
        cartRepository.save(cart);
    }

    private Cart ensureCartWithItems(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        loadCartItems(cart);
        return cart;
    }

    private void loadCartItems(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        if (items == null) {
            items = new ArrayList<>();
        }
        hydrateCartItems(items);
        cart.setItems(items);
    }

    private void hydrateCartItems(List<CartItem> items) {
        if (items.isEmpty()) {
            return;
        }
        List<Long> productIds = items.stream()
                .map(CartItem::getProductId)
                .collect(Collectors.toList());
        List<Product> products = productRepository.findAllById(productIds);
        Map<Long, Product> productById = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        items.forEach(item -> item.setProduct(productById.get(item.getProductId())));
    }

    private Cart createCartForUser(Long userId) {
        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = new Cart();
        cart.setUserId(user.getId());
        cart.setCreatedAt(java.time.LocalDateTime.now());
        return cartRepository.save(cart);
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();
        cartDTO.setId(cart.getId());
        cartDTO.setUserId(cart.getUserId());
        cartDTO.setTotalAmount(cart.getTotalAmount());
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setId(item.getId());
                    Product product = item.getProduct();
                    if (product != null) {
                        dto.setProductId(product.getId());
                        dto.setProductName(product.getName());
                        dto.setProductPrice(product.getPrice());
                        dto.setItemTotal(item.getQuantity() * product.getPrice());
                    } else {
                        dto.setProductId(item.getProductId());
                    }
                    dto.setQuantity(item.getQuantity());
                    return dto;
                })
                .toList();

        cartDTO.setItems(itemDTOs);
        cartDTO.setTotalItems(itemDTOs.size());
        return cartDTO;
    }
}
