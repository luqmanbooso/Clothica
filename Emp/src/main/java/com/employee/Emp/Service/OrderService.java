package com.employee.Emp.Service;

import com.employee.Emp.DTO.OrderDTO;
import com.employee.Emp.DTO.OrderItemDTO;
import com.employee.Emp.Entity.Cart;
import com.employee.Emp.Entity.CartItem;
import com.employee.Emp.Entity.Order;
import com.employee.Emp.Entity.OrderItem;
import com.employee.Emp.Entity.Product;
import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    public OrderDTO createOrder(Long userId, String couponCode) {
        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = loadCartItems(cart);
        cart.calculateTotal();
        if (items.isEmpty()) {
            throw new RuntimeException("Cannot create order with empty cart");
        }

        for (CartItem cartItem : items) {
            Product product = cartItem.getProduct();
            if (product == null) {
                throw new RuntimeException("Product information missing for cart item");
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(cart.getTotalAmount());
        order.setOrderDate(LocalDateTime.now());
        if (order.getOrderNumber() == null) {
            order.setOrderNumber("ORD" + System.currentTimeMillis());
        }
        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : items) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getId());
            orderItem.setProductId(product.getId());
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItemRepository.save(orderItem);

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        cartService.clearCart(userId);
        return convertToDTO(savedOrder);
    }

    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    public OrderDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<OrderDTO> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(this::convertToDTO)
                .toList();
    }

    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<String> validStatuses = Arrays.asList("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");

        if (!validStatuses.contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Invalid Status. Allowed only " + validStatuses);
        }

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    public OrderDTO fulfillOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("SHIPPED");
        if (order.getPaymentStatus() == null || order.getPaymentStatus().equalsIgnoreCase("PENDING")) {
            order.setPaymentStatus("PAID");
        }

        Order updated = orderRepository.save(order);
        return convertToDTO(updated);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setUserId(order.getUserId());
        UserInfo user = userRepository.findById(order.getUserId()).orElse(null);
        orderDTO.setUserName(user != null ? user.getUsername() : null);
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setDiscountAmount(order.getDiscountAmount());
        orderDTO.setAppliedCouponCode(order.getAppliedCouponCode());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setPaymentStatus(order.getPaymentStatus());
        orderDTO.setOrderDate(order.getOrderDate());

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        hydrateOrderItems(items);
        order.setOrderItems(items);

        List<OrderItemDTO> itemDTOs = items.stream()
                .map(item -> {
                    OrderItemDTO dto = new OrderItemDTO();
                    dto.setId(item.getId());
                    Product product = item.getProduct();
                    if (product != null) {
                        dto.setProductId(product.getId());
                        dto.setProductName(product.getName());
                    } else {
                        dto.setProductId(item.getProductId());
                    }
                    dto.setQuantity(item.getQuantity());
                    dto.setPrice(item.getPrice());
                    dto.setItemTotal(item.getQuantity() * item.getPrice());
                    return dto;
                })
                .toList();

        orderDTO.setOrderItems(itemDTOs);
        return orderDTO;
    }

    private List<CartItem> loadCartItems(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        if (items == null) {
            items = new ArrayList<>();
        }
        hydrateCartItems(items);
        cart.setItems(items);
        return items;
    }

    private void hydrateCartItems(List<CartItem> items) {
        if (items.isEmpty()) {
            return;
        }
        List<Long> productIds = items.stream()
                .map(CartItem::getProductId)
                .toList();
        List<Product> products = productRepository.findAllById(productIds);
        Map<Long, Product> productById = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        items.forEach(item -> item.setProduct(productById.get(item.getProductId())));
    }

    private void hydrateOrderItems(List<OrderItem> items) {
        if (items.isEmpty()) {
            return;
        }
        List<Long> productIds = items.stream()
                .map(OrderItem::getProductId)
                .toList();
        List<Product> products = productRepository.findAllById(productIds);
        Map<Long, Product> productById = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        items.forEach(item -> item.setProduct(productById.get(item.getProductId())));
    }
}
