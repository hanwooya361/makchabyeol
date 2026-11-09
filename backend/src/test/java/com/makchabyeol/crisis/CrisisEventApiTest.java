package com.makchabyeol.crisis;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.makchabyeol.common.NightDate;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class CrisisEventApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbc;

    private ResultActions send(String ip) throws Exception {
        return mockMvc.perform(
                post("/api/v1/crisis-events")
                        .with(request -> {
                            request.setRemoteAddr(ip);
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"));
    }

    private long countTonight() {
        return jdbc.queryForObject(
                "SELECT count(*) FROM crisis_event WHERE night_date = ?", Long.class, NightDate.of(Instant.now()));
    }

    @Test
    void 카드가_떴다고_알리면_204이고_오늘_밤_한_건이_는다() throws Exception {
        long before = countTonight();

        send("10.2.0.1").andExpect(status().isNoContent());

        assertThat(countTonight()).isEqualTo(before + 1);
    }

    @Test
    void 테이블에는_방문자를_가리킬_컬럼이_없다() {
        List<String> columns = jdbc.queryForList(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'crisis_event'",
                String.class);

        assertThat(columns).containsExactlyInAnyOrder("id", "night_date", "created_at");
    }

    @Test
    void 같은_IP가_1분에_11번째로_보내면_429() throws Exception {
        for (int i = 0; i < 10; i++) {
            send("10.2.0.2").andExpect(status().isNoContent());
        }
        send("10.2.0.2")
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));
    }
}
