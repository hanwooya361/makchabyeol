package com.makchabyeol.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Flyway V1이 실제로 돌았는지 본다. 앱이 뜨는 것만으로는 마이그레이션 실패를 못 잡는 경우가
 * 있어서, 세 테이블을 직접 조회하고 제약 하나(하루 한 번 카드 찍기)까지 눌러 본다.
 */
@SpringBootTest
class SchemaMigrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    // 메모리 DB 하나를 테스트 전체가 나눠 쓴다. 여기서 보려는 건 "테이블이 있는가"뿐이라
    // 개수가 아니라 조회가 되는지만 본다. 0을 기대하면 먼저 돈 테스트가 남긴 행에 걸린다
    @Test
    void 세_테이블이_만들어진다() {
        assertThat(jdbc.queryForObject("select count(*) from star", Integer.class)).isNotNull();
        assertThat(jdbc.queryForObject("select count(*) from card_tap", Integer.class)).isNotNull();
        assertThat(jdbc.queryForObject("select count(*) from crisis_event", Integer.class))
                .isNotNull();
    }

    @Test
    void 같은_밤에_같은_사람은_한_번만_찍힌다() {
        String insert =
                "insert into card_tap (visitor_id, night_date) values"
                        + " ('11111111-1111-1111-1111-111111111111', date '2026-11-09')";
        jdbc.update(insert);

        assertThatThrownBy(() -> jdbc.update(insert)).isInstanceOf(Exception.class);
    }

    @Test
    void 별_좌표는_범위를_벗어나면_거부된다() {
        assertThatThrownBy(
                        () ->
                                jdbc.update(
                                        "insert into star (visitor_id, night_date, pos_x, pos_y,"
                                            + " hue) values"
                                            + " ('22222222-2222-2222-2222-222222222222', date"
                                            + " '2026-11-09', 1001, 0, 0)"))
                .isInstanceOf(Exception.class);
    }
}
