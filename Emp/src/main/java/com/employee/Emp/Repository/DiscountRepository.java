package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Enum.DiscountTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

        @Query("SELECT d FROM Discount d WHERE d.isActive = true " +
                        "AND d.startDate <= :now AND (d.endDate IS NULL OR d.endDate >= :now)")
        List<Discount> findActiveDiscounts(@Param("now") LocalDateTime now);

        List<Discount> findByCode(String code);

        List<Discount> findByTargetAndIsActiveTrue(DiscountTarget target);

        // Find active discount by code with date validation
        @Query("SELECT d FROM Discount d WHERE d.code = :code AND d.isActive = true " +
                        "AND d.startDate <= :now AND (d.endDate IS NULL OR d.endDate >= :now)")
        List<Discount> findActiveByCode(@Param("code") String code, @Param("now") LocalDateTime now);

        // Find discounts by code and active status
        @Query("SELECT d FROM Discount d WHERE d.code = :code AND d.isActive = true")
        List<Discount> findActiveDiscountsByCode(@Param("code") String code);
}