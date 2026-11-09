package com.makchabyeol.crisis;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CrisisEventController {

    private final CrisisEventService events;

    public CrisisEventController(CrisisEventService events) {
        this.events = events;
    }

    /** 본문을 읽지 않는다. 무엇을 보내든 "한 번 떴다"만 남는다. */
    @PostMapping("/crisis-events")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void record() {
        events.record();
    }
}
