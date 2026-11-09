package com.makchabyeol.common;

import java.time.Instant;
import java.time.LocalDate;
import java.util.concurrent.TimeUnit;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 익명 ID가 붙은 기록(별·카드 찍기)은 90일이 지나면 지운다. 개인정보 처리방침(privacy.html)에 적은 약속이다.
 * 위기 안내 횟수는 누구의 것인지 알 수 없는 숫자라 남긴다.
 *
 * <p>Render 무료 서버는 자다가 깨므로 "매일 새벽 4시" 같은 시각 예약은 건너뛰어질 수 있다.
 * 그래서 깨어나자마자 한 번, 깨어 있는 동안 6시간마다 돈다.
 */
@Component
public class RetentionJob {

    static final int KEEP_DAYS = 90;

    private final JdbcTemplate jdbc;

    public RetentionJob(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Scheduled(fixedDelay = 6, timeUnit = TimeUnit.HOURS)
    public void purge() {
        LocalDate cutoff = NightDate.of(Instant.now()).minusDays(KEEP_DAYS);
        // 테이블 두 개에 SQL 한 줄씩이라 엔티티를 하나씩 읽어 지우는 JPA 파생 삭제 대신 바로 날린다
        jdbc.update("DELETE FROM star WHERE night_date < ?", cutoff);
        jdbc.update("DELETE FROM card_tap WHERE night_date < ?", cutoff);
    }
}
