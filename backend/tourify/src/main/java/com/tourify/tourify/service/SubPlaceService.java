package com.tourify.tourify.service;

import com.tourify.tourify.entity.SubPlace;
import com.tourify.tourify.repository.SubPlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubPlaceService {

    @Autowired
    private SubPlaceRepository subPlaceRepository;

    public List<SubPlace> findByDestinationId(Long destinationId) {
        return subPlaceRepository.findByDestinationId(destinationId);
    }
}