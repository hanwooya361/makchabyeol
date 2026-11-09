package com.makchabyeol.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class RetentionJobTest {

    @Autowired private RetentionJob job;
    @Autowired private JdbcTemplate jdbc;

    private long rows(String table, UUID visitor) {
        return jdbc.queryForObject(
                "SELECT count(*) FROM " + table + " WHERE visitor_id = ?", Long.class, visitor);
    }

    @Test
    void 지난_90일보다_오래된_별과_카드_기록만_지운다() {
        LocalDate tonight = NightDate.of(Instant.now());
        UUID old = UUID.randomUUID();
        UUID recent = UUID.randomUUID();
        for (Object[] row : new Object[][] {
            {old, tonight.minusDays(RetentionJob.KEEP_DAYS + 1)},
            {recent, tonight.minusDays(RetentionJob.KEEP_DAYS)},
        }) {
            jdbc.update("INSERT INTO star (visitor_id, night_date, pos_x, pos_y, hue) VALUES (?, ?, 0, 0, 0)", row);
            jdbc.update("INSERT INTO card_tap (visitor_id, night_date) VALUES (?, ?)", row);
        }

        job.purge();

        assertThat(rows("star", old)).isZero();
        assertThat(rows("card_tap", old)).isZero();
        assertThat(rows("star", recent)).isEqualTo(1);
        assertThat(rows("card_tap", recent)).isEqualTo(1);
    }
}
