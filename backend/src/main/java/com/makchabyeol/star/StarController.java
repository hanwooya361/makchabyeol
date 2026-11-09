package com.makchabyeol.star;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class StarController {

    private final StarService starService;

    public StarController(StarService starService) {
        this.starService = starService;
    }

    @GetMapping("/night")
    public NightResponse night() {
        return starService.night();
    }

    @PostMapping("/stars")
    @ResponseStatus(HttpStatus.CREATED)
    public StarResponse create(@Valid @RequestBody StarRequest request) {
        return starService.create(request.visitorId());
    }
}
