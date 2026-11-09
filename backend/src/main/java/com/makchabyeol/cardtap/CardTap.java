package com.makchabyeol.cardtap;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** "오늘도 버텼다" 도장 한 번. 같은 밤에 또 찍어도 행은 하나만 남는다(UNIQUE). */
@Entity
public class CardTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID visitorId;

    @Column(nullable = false)
    private LocalDate nightDate;

    /** 값은 DB 기본값(CURRENT_TIMESTAMP)이 채운다. 서버 시계를 믿지 않아도 된다. */
    @Column(nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected CardTap() {}

    public CardTap(UUID visitorId, LocalDate nightDate) {
        this.visitorId = visitorId;
        this.nightDate = nightDate;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getNightDate() {
        return nightDate;
    }
}
