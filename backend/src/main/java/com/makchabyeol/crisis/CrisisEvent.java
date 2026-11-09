package com.makchabyeol.crisis;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;
import java.time.LocalDate;

/**
 * 위기 안내 카드가 한 번 떴다는 사실. 원문도 방문자 ID도 없다 — 운영자는 "몇 번 떴는지"만 알면 된다
 * (docs/tech-design.md 3장).
 */
@Entity
public class CrisisEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate nightDate;

    /** 값은 DB 기본값(CURRENT_TIMESTAMP)이 채운다. */
    @Column(nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected CrisisEvent() {}

    public CrisisEvent(LocalDate nightDate) {
        this.nightDate = nightDate;
    }
}
