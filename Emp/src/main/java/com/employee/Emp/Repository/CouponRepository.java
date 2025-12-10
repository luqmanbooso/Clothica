package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CouponRepository extends MongoRepository<Coupon, Long> {
}
