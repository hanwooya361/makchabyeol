package com.makchabyeol.config;

import com.makchabyeol.common.RateLimitedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 경로 하나에 대해 IP당 1분 POST 횟수를 센다. 분이 바뀌면 통째로 비워서 메모리가 쌓이지 않는다.
 * IP는 이 맵 안에서만 쓰고 저장·로그하지 않는다(docs/tech-design.md 5장).
 * 필터가 아니라 인터셉터인 이유: 여기서 던진 예외가 ApiExceptionHandler로 가서 에러 형식이 한 경로로 나간다.
 *
 * <p>shortcut: 1분 고정 창이라 분 경계에서 최대 2배까지 통과하고, 서버 1대 기준이다. 여러 대가 되면 Redis로 옮긴다.
 */
public class RateLimitInterceptor implements HandlerInterceptor {

    private final int limitPerMinute;
    private final Supplier<RateLimitedException> error;
    private final Map<String, AtomicInteger> counts = new ConcurrentHashMap<>();
    private volatile long currentMinute;

    public RateLimitInterceptor(int limitPerMinute, Supplier<RateLimitedException> error) {
        this.limitPerMinute = limitPerMinute;
        this.error = error;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS 사전 요청(OPTIONS)이나 조회는 세지 않는다
        if (!"POST".equals(request.getMethod())) {
            return true;
        }
        long minute = System.currentTimeMillis() / 60_000;
        if (minute != currentMinute) {
            currentMinute = minute;
            counts.clear();
        }
        int count = counts.computeIfAbsent(request.getRemoteAddr(), ip -> new AtomicInteger()).incrementAndGet();
        if (count > limitPerMinute) {
            throw error.get();
        }
        return true;
    }
}
