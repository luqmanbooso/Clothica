package com.employee.Emp.Entity;

import com.employee.Emp.Enum.DiscountTarget;
import com.employee.Emp.Enum.DiscountValueType;
import com.employee.Emp.filter.DiscountCalculationResult;
import com.employee.Emp.filter.OrderContext;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "discount_type")
public abstract class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    // optional for coupon codes
    private String code;
    private String description;

    @Enumerated(EnumType.STRING)
    private DiscountTarget target; // PRODUCT, CATEGORY, CART, SHIPPING

    @Enumerated(EnumType.STRING)
    private DiscountValueType valueType;

    private BigDecimal discountValue; // e.g., 20 for 20%, or 10.00 for $10 off

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Integer maxUses;
    private Integer usesCount = 0;
    private Integer maxUsesPerCustomer;

    private BigDecimal minimumCartValue;
    private BigDecimal maximumDiscountAmount;

    private Boolean isActive = true;
    private Boolean isStackable = false; // can combine with other discounts
    private Boolean isExclusive = false; // override other discount

    @ManyToMany
    @JoinTable(name = "discount_excluded_products")
    private Set<Product> excludedProducts = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "discount_excluded_categories")
    private Set<Category> excludedCategories = new HashSet<>();

    // Abstract method for calculating discount
    public abstract DiscountCalculationResult calculateDiscount(OrderContext context);

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DiscountTarget getTarget() { return target; }
    public void setTarget(DiscountTarget target) { this.target = target; }

    public DiscountValueType getValueType() { return valueType; }
    public void setValueType(DiscountValueType valueType) { this.valueType = valueType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }

    public Integer getUsesCount() { return usesCount; }
    public void setUsesCount(Integer usesCount) { this.usesCount = usesCount; }

    public Integer getMaxUsesPerCustomer() { return maxUsesPerCustomer; }
    public void setMaxUsesPerCustomer(Integer maxUsesPerCustomer) { this.maxUsesPerCustomer = maxUsesPerCustomer; }

    public BigDecimal getMinimumCartValue() { return minimumCartValue; }
    public void setMinimumCartValue(BigDecimal minimumCartValue) { this.minimumCartValue = minimumCartValue; }

    public BigDecimal getMaximumDiscountAmount() { return maximumDiscountAmount; }
    public void setMaximumDiscountAmount(BigDecimal maximumDiscountAmount) { this.maximumDiscountAmount = maximumDiscountAmount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsStackable() { return isStackable; }
    public void setIsStackable(Boolean isStackable) { this.isStackable = isStackable; }

    public Boolean getIsExclusive() { return isExclusive; }
    public void setIsExclusive(Boolean isExclusive) { this.isExclusive = isExclusive; }

    public Set<Product> getExcludedProducts() { return excludedProducts; }
    public void setExcludedProducts(Set<Product> excludedProducts) { this.excludedProducts = excludedProducts; }

    public Set<Category> getExcludedCategories() { return excludedCategories; }
    public void setExcludedCategories(Set<Category> excludedCategories) { this.excludedCategories = excludedCategories; }
}
