package com.makchabyeol.star;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** 하늘에 뜬 별 하나. 걱정 원문은 여기에도, 어디에도 없다. */
@Entity
public class Star {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID visitorId;

    @Column(nullable = false)
    private LocalDate nightDate;

    // 끝 글자가 대문자 하나뿐이면 기본 전략이 pos_x가 아니라 posx로 바꾼다. 이름을 직접 적는다
    @Column(name = "pos_x", nullable = false)
    private short posX;

    @Column(name = "pos_y", nullable = false)
    private short posY;

    @Column(nullable = false)
    private short hue;

    /** 값은 DB 기본값(CURRENT_TIMESTAMP)이 채운다. 서버 시계를 믿지 않아도 된다. */
    @Column(nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected Star() {}

    public Star(UUID visitorId, LocalDate nightDate, short posX, short posY, short hue) {
        this.visitorId = visitorId;
        this.nightDate = nightDate;
        this.posX = posX;
        this.posY = posY;
        this.hue = hue;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getNightDate() {
        return nightDate;
    }

    public short getPosX() {
        return posX;
    }

    public short getPosY() {
        return posY;
    }

    public short getHue() {
        return hue;
    }
}
