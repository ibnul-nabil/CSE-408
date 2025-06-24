package com.tourify.tourify.controller;

import com.tourify.tourify.entity.Destination;
import com.tourify.tourify.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@CrossOrigin(origins = {"http://localhost:3000", "http://20.40.57.81", "http://20.40.57.81:80"}, allowCredentials = "true")
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