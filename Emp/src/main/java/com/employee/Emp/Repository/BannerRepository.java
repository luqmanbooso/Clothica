package com.employee.Emp.Repository;

import com.employee.Emp.Entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByIsActiveTrueOrderByPriorityDesc();

    List<Banner> findByPosition(String position);

    List<Banner> findByPositionAndIsActiveTrue(String position);

    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
            "AND (b.startDate IS NULL OR b.startDate <= :now) " +
            "AND (b.endDate IS NULL OR b.endDate >= :now) " +
            "ORDER BY b.priority DESC")
    List<Banner> findActiveBanners(@Param("now") LocalDateTime now);

    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
            "AND b.position = :position " +
            "AND (b.startDate IS NULL OR b.startDate <= :now) " +
            "AND (b.endDate IS NULL OR b.endDate >= :now) " +
            "ORDER BY b.priority DESC")
    List<Banner> findActiveBannersByPosition(
            @Param("position") String position,
            @Param("now") LocalDateTime now);

    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
            "AND b.event.id = :eventId " +
            "AND (b.startDate IS NULL OR b.startDate <= :now) " +
            "AND (b.endDate IS NULL OR b.endDate >= :now) " +
            "ORDER BY b.priority DESC")
    List<Banner> findActiveBannersByEvent(
            @Param("eventId") Long eventId,
            @Param("now") LocalDateTime now);

    List<Banner> findAllByOrderByPriorityDesc();
}
