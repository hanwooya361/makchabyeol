package com.makchabyeol.common;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** 테스트마다 IP를 달리 줘서 다른 테스트와 IP 카운터가 섞이지 않게 한다. */
@SpringBootTest
@AutoConfigureMockMvc
class RateLimitApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    private ResultActions send(String path, String ip, UUID visitorId) throws Exception {
        return mockMvc.perform(
                post(path)
                        .with(request -> {
                            request.setRemoteAddr(ip);
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visitorId\":\"" + visitorId + "\"}"));
    }

    @Test
    void 같은_방문자가_1분에_4번째_별을_띄우면_429() throws Exception {
        UUID visitor = UUID.randomUUID();
        for (int i = 0; i < 3; i++) {
            send("/api/v1/stars", "10.1.0.1", visitor).andExpect(status().isCreated());
        }
        send("/api/v1/stars", "10.1.0.1", visitor)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_STARS"))
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void 같은_방문자가_한_밤에_21번째_별을_띄우면_429() throws Exception {
        UUID visitor = UUID.randomUUID();
        // 1분 한도에 걸리지 않게 한 시간 전에 뜬 별 20개를 깔아 둔다
        Timestamp anHourAgo = Timestamp.from(Instant.now().minus(1, ChronoUnit.HOURS));
        for (int i = 0; i < 20; i++) {
            jdbc.update(
                    "INSERT INTO star (visitor_id, night_date, pos_x, pos_y, hue, created_at) VALUES (?, ?, 0, 0, 0, ?)",
                    visitor,
                    NightDate.of(Instant.now()),
                    anHourAgo);
        }
        send("/api/v1/stars", "10.1.0.2", visitor)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_STARS"));
    }

    @Test
    void 같은_IP가_1분에_11번째로_카드를_찍으면_429() throws Exception {
        // 방문자 ID를 바꿔 가며 찍어도 IP 한도는 막는다
        for (int i = 0; i < 10; i++) {
            send("/api/v1/card-taps", "10.1.0.3", UUID.randomUUID()).andExpect(status().isCreated());
        }
        send("/api/v1/card-taps", "10.1.0.3", UUID.randomUUID())
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"))
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void 같은_IP가_1분에_11번째_별을_띄우면_429() throws Exception {
        for (int i = 0; i < 10; i++) {
            send("/api/v1/stars", "10.1.0.4", UUID.randomUUID()).andExpect(status().isCreated());
        }
        send("/api/v1/stars", "10.1.0.4", UUID.randomUUID())
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_STARS"));
    }
}
