package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    /**
     * Find hotels by destination ID
     */
    List<Hotel> findByDestinationId(Long destinationId);
    
    /**
     * Find hotels by sub-place ID
     */
    List<Hotel> findBySubPlaceId(Long subPlaceId);
    
    /**
     * Find hotels by destination ID or sub-place ID
     */
    @Query("SELECT h FROM Hotel h WHERE h.destination.id = :destinationId OR h.subPlace.id = :subPlaceId")
    List<Hotel> findByDestinationIdOrSubPlaceId(@Param("destinationId") Long destinationId, 
                                               @Param("subPlaceId") Long subPlaceId);
    
    /**
     * Find hotels by multiple destination IDs
     */
    @Query("SELECT h FROM Hotel h WHERE h.destination.id IN :destinationIds")
    List<Hotel> findByDestinationIds(@Param("destinationIds") List<Long> destinationIds);
    
    /**
     * Find hotels by multiple sub-place IDs
     */
    @Query("SELECT h FROM Hotel h WHERE h.subPlace.id IN :subPlaceIds")
    List<Hotel> findBySubPlaceIds(@Param("subPlaceIds") List<Long> subPlaceIds);
    
    /**
     * Find hotels by destination or sub-place IDs
     */
    @Query("SELECT h FROM Hotel h WHERE h.destination.id IN :destinationIds OR h.subPlace.id IN :subPlaceIds")
    List<Hotel> findByDestinationIdsOrSubPlaceIds(@Param("destinationIds") List<Long> destinationIds, 
                                                  @Param("subPlaceIds") List<Long> subPlaceIds);
    
    /**
     * Search hotels by name (case-insensitive)
     */
    @Query("SELECT h FROM Hotel h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Hotel> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    /**
     * Find hotels by price range
     */
    @Query("SELECT h FROM Hotel h WHERE h.pricePerNight BETWEEN :minPrice AND :maxPrice")
    List<Hotel> findByPricePerNightBetween(@Param("minPrice") Double minPrice, 
                                          @Param("maxPrice") Double maxPrice);
} 