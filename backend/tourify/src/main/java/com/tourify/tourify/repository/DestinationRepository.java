package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Destination;
import com.tourify.tourify.entity.SubPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByNameContainingIgnoreCase(String search);
    Optional<Destination> findByNameIgnoreCase(String name);
}
