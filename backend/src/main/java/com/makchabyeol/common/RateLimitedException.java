package com.makchabyeol.common;

/** 한도 초과. ApiExceptionHandler가 429와 통일된 에러 형식으로 바꾼다. */
public class RateLimitedException extends RuntimeException {

    private final String code;

    private RateLimitedException(String code, String message) {
        super(message);
        this.code = code;
    }

    public static RateLimitedException stars() {
        return new RateLimitedException("TOO_MANY_STARS", "별이 많이 떴어요. 잠깐 쉬었다가 다시 띄워 주세요.");
    }

    public static RateLimitedException requests() {
        return new RateLimitedException("TOO_MANY_REQUESTS", "잠깐 쉬었다가 다시 해 주세요.");
    }

    public String getCode() {
        return code;
    }
}
