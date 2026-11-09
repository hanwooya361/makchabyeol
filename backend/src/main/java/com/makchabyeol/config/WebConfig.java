package com.makchabyeol.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 프론트는 다른 도메인(정적 호스팅)에서 뜬다. 허용 주소는 환경변수로만 받는다. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(@Value("${app.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 쿠키·인증 헤더를 쓰지 않으므로 allowCredentials는 켜지 않는다
        registry.addMapping("/api/**").allowedOrigins(allowedOrigins).allowedMethods("GET", "POST");
    }
}
