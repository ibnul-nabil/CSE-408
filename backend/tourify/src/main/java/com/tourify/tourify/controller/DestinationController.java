package com.tourify.tourify.controller;

import com.tourify.tourify.entity.Destination;
import com.tourify.tourify.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    @Autowired
    private DestinationRepository destinationRepository;

    @GetMapping
    public List<Destination> searchDestinations(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return destinationRepository.findByNameContainingIgnoreCase(search);
        } else {
            return destinationRepository.findAll();
        }
    }
}