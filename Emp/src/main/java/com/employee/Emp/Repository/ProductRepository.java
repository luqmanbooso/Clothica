package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Product;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, Long> {

    interface CategoryCount {
        String getCategory();
        long getCount();
    }

    @Aggregation(pipeline = {
            "{ $match: { category: { $ne: null } } }",
            "{ $group: { _id: '$category', count: { $sum: 1 } } }",
            "{ $project: { category: '$_id', count: 1, _id: 0 } }"
    })
    List<CategoryCount> findCategoryCounts();
}
