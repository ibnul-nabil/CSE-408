package com.tourify.tourify.repository;

import com.tourify.tourify.entity.SubPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubPlaceRepository extends JpaRepository<SubPlace, Long> {
    List<SubPlace> findByDestinationId(Long destinationId);
}
