package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product,Long> {

    interface CategoryCount {
        String getCategory();
        long getCount();
    }

    @Query("select p.category as category, count(p) as count from Product p where p.category is not null group by p.category")
    java.util.List<CategoryCount> findCategoryCounts();
}
