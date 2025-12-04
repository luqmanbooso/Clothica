package com.employee.Emp.Service;

import com.employee.Emp.DTO.OrderDTO;
import com.employee.Emp.DTO.OrderItemDTO;
import com.employee.Emp.Entity.*;
import com.employee.Emp.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;


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

    public OrderDTO createOrder(Integer userId) {
        // 1. Get user and cart
        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        // 2. Validate cart is not empty
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create order with empty cart");
        }

        // 3. Check stock for all items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
        }

        // 4. Create order entity
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(cart.getTotalAmount());

        Order savedOrder = orderRepository.save(order);

        // 5. Convert cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItemRepository.save(orderItem);

            // Update product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // 6. Clear the cart after order creation
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

    public List<OrderDTO> getUserOrders(Integer userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(this::convertToDTO)
                .toList();
    }

    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<String> validStatuses = Arrays.asList("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");

        if(!validStatuses.contains(status.toUpperCase())){
            throw new IllegalArgumentException("Invalid Status. Allowed only "+validStatuses);
        }

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);

        return convertToDTO(updatedOrder);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setUserId(order.getUser().getId());
        orderDTO.setUserName(order.getUser().getUsername());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setPaymentStatus(order.getPaymentStatus());
        orderDTO.setOrderDate(order.getOrderDate());

        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDTO dto = new OrderItemDTO();
                    dto.setId(item.getId());
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getName());
                    dto.setQuantity(item.getQuantity());
                    dto.setPrice(item.getPrice());
                    dto.setItemTotal(item.getQuantity() * item.getPrice());
                    return dto;
                })
                .toList();

        orderDTO.setOrderItems(itemDTOs);

        return orderDTO;
    }
}
