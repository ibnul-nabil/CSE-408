package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Tour;
import com.tourify.tourify.entity.TourRoute;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TourRouteRepository extends JpaRepository<TourRoute, Long> {
    TourRoute findFirstByTour(Tour tour);
} 