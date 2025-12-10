package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Banner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BannerRepository extends MongoRepository<Banner, Long> {

    List<Banner> findByIsActiveTrueOrderByPriorityDesc();

    List<Banner> findByPosition(String position);

    List<Banner> findByPositionAndIsActiveTrue(String position);

    @Query(value = "{ 'is_active': true, '$and': [ { '$or': [ { 'start_date': null }, { 'start_date': { $lte: ?0 } } ] }, { '$or': [ { 'end_date': null }, { 'end_date': { $gte: ?0 } } ] } ] }",
           sort = "{ 'priority': -1 }")
    List<Banner> findActiveBanners(LocalDateTime now);

    @Query(value = "{ 'is_active': true, 'position': ?0, '$and': [ { '$or': [ { 'start_date': null }, { 'start_date': { $lte: ?1 } } ] }, { '$or': [ { 'end_date': null }, { 'end_date': { $gte: ?1 } } ] } ] }",
           sort = "{ 'priority': -1 }")
    List<Banner> findActiveBannersByPosition(String position, LocalDateTime now);

    @Query(value = "{ 'is_active': true, 'event_id': ?0, '$and': [ { '$or': [ { 'start_date': null }, { 'start_date': { $lte: ?1 } } ] }, { '$or': [ { 'end_date': null }, { 'end_date': { $gte: ?1 } } ] } ] }",
           sort = "{ 'priority': -1 }")
    List<Banner> findActiveBannersByEvent(Long eventId, LocalDateTime now);

    List<Banner> findAllByOrderByPriorityDesc();
}
