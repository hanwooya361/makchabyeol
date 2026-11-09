package com.makchabyeol.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 400을 한 곳에서 같은 형식으로 돌려준다. UUID가 아닌 문자열은 Jackson이 본문을 읽다가 터지고(읽기 실패),
 * 아예 빠진 값은 @Valid가 잡는다 — 사용자에게는 둘 다 같은 사정이라 코드도 하나로 묶는다.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final ErrorResponse INVALID_VISITOR_ID =
            new ErrorResponse("INVALID_VISITOR_ID", "새로고침하면 다시 띄울 수 있어요.");

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ErrorResponse> invalidRequest() {
        return ResponseEntity.badRequest().body(INVALID_VISITOR_ID);
    }

    @ExceptionHandler(RateLimitedException.class)
    public ResponseEntity<ErrorResponse> rateLimited(RateLimitedException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ErrorResponse(e.getCode(), e.getMessage()));
    }
}
