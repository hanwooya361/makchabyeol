package com.makchabyeol.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

/** 프론트 lib/night.test.js와 같은 경계를 본다. 두 곳이 어긋나면 별 개수가 안 맞는다. */
class NightDateTest {

    @Test
    void 한국_정오_직전은_전날_밤이다() {
        assertThat(NightDate.of(Instant.parse("2026-11-08T02:59:59Z"))) // KST 11:59:59
                .isEqualTo(LocalDate.of(2026, 11, 7));
    }

    @Test
    void 한국_정오부터_새_밤이다() {
        assertThat(NightDate.of(Instant.parse("2026-11-08T03:00:00Z"))) // KST 12:00
                .isEqualTo(LocalDate.of(2026, 11, 8));
    }

    @Test
    void 자정을_넘겨도_같은_밤이다() {
        assertThat(NightDate.of(Instant.parse("2026-11-08T15:10:00Z"))) // KST 11/9 00:10
                .isEqualTo(LocalDate.of(2026, 11, 8));
    }

    @Test
    void 연말에도_날짜가_넘어간다() {
        assertThat(NightDate.of(Instant.parse("2027-01-01T02:00:00Z"))) // KST 11:00
                .isEqualTo(LocalDate.of(2026, 12, 31));
    }
}
