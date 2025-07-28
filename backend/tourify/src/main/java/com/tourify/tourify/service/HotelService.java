package com.tourify.tourify.service;

import com.tourify.tourify.dto.HotelResponse;
import com.tourify.tourify.entity.Hotel;
import com.tourify.tourify.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelService {
    
    @Autowired
    private HotelRepository hotelRepository;
    
    /**
     * Get all hotels
     */
    public List<HotelResponse> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotel by ID
     */
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        return convertToResponse(hotel);
    }
    
    /**
     * Get hotels by destination ID
     */
    public List<HotelResponse> getHotelsByDestination(Long destinationId) {
        List<Hotel> hotels = hotelRepository.findByDestinationId(destinationId);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotels by sub-place ID
     */
    public List<HotelResponse> getHotelsBySubPlace(Long subPlaceId) {
        List<Hotel> hotels = hotelRepository.findBySubPlaceId(subPlaceId);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotels by destination ID or sub-place ID
     */
    public List<HotelResponse> getHotelsByDestinationOrSubPlace(Long destinationId, Long subPlaceId) {
        List<Hotel> hotels = hotelRepository.findByDestinationIdOrSubPlaceId(destinationId, subPlaceId);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotels by multiple destination IDs
     */
    public List<HotelResponse> getHotelsByDestinations(List<Long> destinationIds) {
        List<Hotel> hotels = hotelRepository.findByDestinationIds(destinationIds);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotels by multiple sub-place IDs
     */
    public List<HotelResponse> getHotelsBySubPlaces(List<Long> subPlaceIds) {
        List<Hotel> hotels = hotelRepository.findBySubPlaceIds(subPlaceIds);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotels by destination IDs or sub-place IDs
     */
    public List<HotelResponse> getHotelsByDestinationsOrSubPlaces(List<Long> destinationIds, List<Long> subPlaceIds) {
        List<Hotel> hotels = hotelRepository.findByDestinationIdsOrSubPlaceIds(destinationIds, subPlaceIds);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Search hotels by name
     */
    public List<HotelResponse> searchHotelsByName(String searchTerm) {
        List<Hotel> hotels = hotelRepository.findByNameContainingIgnoreCase(searchTerm);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get hotels by price range
     */
    public List<HotelResponse> getHotelsByPriceRange(Double minPrice, Double maxPrice) {
        List<Hotel> hotels = hotelRepository.findByPricePerNightBetween(minPrice, maxPrice);
        return hotels.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Hotel entity to HotelResponse DTO
     */
    private HotelResponse convertToResponse(Hotel hotel) {
        HotelResponse response = new HotelResponse();
        response.setId(hotel.getId());
        response.setName(hotel.getName());
        response.setPricePerNight(hotel.getPricePerNight());
        response.setLocation(hotel.getLocation());
        response.setCoordinates(hotel.getCoordinates());
        response.setThumbnail(hotel.getThumbnail());
        response.setExternalLink(hotel.getExternalLink());
        
        // Set destination info
        if (hotel.getDestination() != null) {
            response.setDestinationId(hotel.getDestination().getId());
            response.setDestinationName(hotel.getDestination().getName());
        }
        
        // Set sub-place info
        if (hotel.getSubPlace() != null) {
            response.setSubPlaceId(hotel.getSubPlace().getId());
            response.setSubPlaceName(hotel.getSubPlace().getName());
        }
        
        // Convert amenities array to list
        if (hotel.getAmenities() != null) {
            response.setAmenities(java.util.Arrays.asList(hotel.getAmenities()));
        }
        
        return response;
    }
} 