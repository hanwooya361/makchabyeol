package com.makchabyeol.crisis;

import com.makchabyeol.common.NightDate;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class CrisisEventService {

    private final CrisisEventRepository events;

    public CrisisEventService(CrisisEventRepository events) {
        this.events = events;
    }

    public void record() {
        events.save(new CrisisEvent(NightDate.of(Instant.now())));
    }
}
