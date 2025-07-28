package com.tourify.tourify.repository;

import com.tourify.tourify.entity.TransportStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportStopRepository extends JpaRepository<TransportStop, TransportStop.TransportStopId> {
    
    // Find all stops for a specific transport
    @Query("SELECT ts FROM TransportStop ts WHERE ts.transport.id = :transportId ORDER BY ts.stop.name")
    List<TransportStop> findByTransportId(@Param("transportId") Long transportId);
    
    // Find all stops for multiple transports
    @Query("SELECT ts FROM TransportStop ts WHERE ts.transport.id IN :transportIds ORDER BY ts.transport.id, ts.stop.name")
    List<TransportStop> findByTransportIds(@Param("transportIds") List<Long> transportIds);
    
    // Find stop by transport and destination
    @Query("SELECT ts FROM TransportStop ts WHERE ts.transport.id = :transportId AND ts.stop.id = :stopId")
    TransportStop findByTransportIdAndStopId(@Param("transportId") Long transportId, @Param("stopId") Long stopId);
} 