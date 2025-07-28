package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {
    
    // Find transport by start and end points
    @Query("SELECT t FROM Transport t WHERE t.startPoint.id = :startPointId AND t.endPoint.id = :endPointId")
    List<Transport> findByStartPointAndEndPoint(@Param("startPointId") Long startPointId, 
                                               @Param("endPointId") Long endPointId);
    
    // Find transport by type
    List<Transport> findByType(String type);
    
    // Find transport by class
    List<Transport> findByTransportClass(String transportClass);
    
    // Find transport by start point
    @Query("SELECT t FROM Transport t WHERE t.startPoint.id = :startPointId")
    List<Transport> findByStartPoint(@Param("startPointId") Long startPointId);
    
    // Find transport by end point
    @Query("SELECT t FROM Transport t WHERE t.endPoint.id = :endPointId")
    List<Transport> findByEndPoint(@Param("endPointId") Long endPointId);
    
    // Find transport by type and class
    List<Transport> findByTypeAndTransportClass(String type, String transportClass);
} 