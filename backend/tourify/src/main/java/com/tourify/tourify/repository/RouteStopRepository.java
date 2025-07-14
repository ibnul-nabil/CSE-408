package com.tourify.tourify.repository;

import com.tourify.tourify.entity.RouteStop;
import com.tourify.tourify.entity.TourRoute;
import com.tourify.tourify.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {
    List<RouteStop> findByRoute(TourRoute route);
    
    @Query("SELECT rs FROM RouteStop rs JOIN rs.route r WHERE r.tour = :tour ORDER BY rs.stopOrder")
    List<RouteStop> findByRoute_TourOrderByStopOrder(@Param("tour") Tour tour);
} 