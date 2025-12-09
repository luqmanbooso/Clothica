package com.employee.Emp.filter;

import java.math.BigDecimal;

public class DiscountItem {
    private Long productId;
    private String productName;
    private BigDecimal price;
    private int quantity;
    private Long categoryId;

    // Constructors
    public DiscountItem() {}

    public DiscountItem(Long productId, String productName, BigDecimal price, int quantity, Long categoryId) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.categoryId = categoryId;
    }

    // Getters and setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}