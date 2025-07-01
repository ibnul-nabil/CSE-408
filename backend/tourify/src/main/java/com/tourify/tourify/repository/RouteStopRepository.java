package com.tourify.tourify.repository;

import com.tourify.tourify.entity.RouteStop;
import com.tourify.tourify.entity.TourRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {
    List<RouteStop> findByRoute(TourRoute route);
} 