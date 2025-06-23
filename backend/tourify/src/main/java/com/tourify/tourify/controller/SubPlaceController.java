package com.tourify.tourify.controller;

import com.tourify.tourify.entity.SubPlace;
import com.tourify.tourify.service.SubPlaceService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SubPlaceController {

    @Autowired
    private SubPlaceService subPlaceService;

    @GetMapping("/subplaces")
    public ResponseEntity<List<SubPlace>> getSubPlaces(
            @RequestParam String destination
    ) {
        System.out.println("Destination: " + destination);
        List<SubPlace> subplaces = subPlaceService.findByDestination(destination);
        return ResponseEntity.ok(subplaces);
    }
}