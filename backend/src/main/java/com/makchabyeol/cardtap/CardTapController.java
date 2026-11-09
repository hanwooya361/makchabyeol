package com.makchabyeol.cardtap;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CardTapController {

    private final CardTapService cardTaps;

    public CardTapController(CardTapService cardTaps) {
        this.cardTaps = cardTaps;
    }

    /** 오늘 처음이면 201, 이미 찍었으면 200. 둘 다 사용자에게는 성공이다. */
    @PostMapping("/card-taps")
    public ResponseEntity<CardTapResponse> tap(@Valid @RequestBody CardTapRequest request) {
        CardTapResponse body = cardTaps.tap(request.visitorId());
        return ResponseEntity.status(body.firstToday() ? HttpStatus.CREATED : HttpStatus.OK)
                .body(body);
    }
}
