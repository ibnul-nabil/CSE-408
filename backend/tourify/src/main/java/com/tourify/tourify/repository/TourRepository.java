package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Tour;
import com.tourify.tourify.entity.Tour.TourStatus;
import com.tourify.tourify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByUserOrderByCreatedAtDesc(User user);
}
