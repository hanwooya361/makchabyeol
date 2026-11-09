package com.makchabyeol.common;

/** 모든 에러 응답은 이 형식 하나로 나간다(docs/tech-design.md 4장). */
public record ErrorResponse(String code, String message) {}
