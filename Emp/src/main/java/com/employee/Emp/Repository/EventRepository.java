package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByIsActiveTrueOrderByStartDateDesc();

    @Query("SELECT e FROM Event e WHERE e.isActive = true " +
            "AND (e.startDate IS NULL OR e.startDate <= :now) " +
            "AND (e.endDate IS NULL OR e.endDate >= :now) " +
            "ORDER BY e.startDate DESC")
    List<Event> findActiveEvents(@Param("now") LocalDateTime now);

    List<Event> findByType(String type);

    List<Event> findAllByOrderByStartDateDesc();
}
