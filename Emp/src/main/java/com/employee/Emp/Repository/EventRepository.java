package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, Long> {

    List<Event> findByIsActiveTrueOrderByStartDateDesc();

    @Query(value = "{ 'is_active': true, '$and': [ { '$or': [ { 'start_date': null }, { 'start_date': { $lte: ?0 } } ] }, { '$or': [ { 'end_date': null }, { 'end_date': { $gte: ?0 } } ] } ] }",
           sort = "{ 'start_date': -1 }")
    List<Event> findActiveEvents(LocalDateTime now);

    List<Event> findByType(String type);

    List<Event> findAllByOrderByStartDateDesc();
}
