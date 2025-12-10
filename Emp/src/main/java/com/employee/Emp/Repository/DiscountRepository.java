package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Discount;
import com.employee.Emp.Enum.DiscountTarget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface DiscountRepository extends MongoRepository<Discount, Long> {

    @Query(value = "{ 'is_active': true, '$and': [ { '$or': [ { 'start_date': null }, { 'start_date': { $lte: ?0 } } ] }, { '$or': [ { 'end_date': null }, { 'end_date': { $gte: ?0 } } ] } ] }")
    List<Discount> findActiveDiscounts(LocalDateTime now);

    List<Discount> findByCode(String code);

    List<Discount> findByTargetAndIsActiveTrue(DiscountTarget target);

    @Query(value = "{ 'code': ?0, 'is_active': true, '$and': [ { '$or': [ { 'start_date': null }, { 'start_date': { $lte: ?1 } } ] }, { '$or': [ { 'end_date': null }, { 'end_date': { $gte: ?1 } } ] } ] }")
    List<Discount> findActiveByCode(String code, LocalDateTime now);

    @Query(value = "{ 'code': ?0, 'is_active': true }")
    List<Discount> findActiveDiscountsByCode(String code);
}
