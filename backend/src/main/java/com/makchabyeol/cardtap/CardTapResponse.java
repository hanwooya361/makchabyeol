package com.makchabyeol.cardtap;

import java.time.LocalDate;

/** firstToday가 false면 오늘 밤 이미 찍은 사람이다(docs/tech-design.md 4장). */
public record CardTapResponse(LocalDate nightDate, boolean firstToday) {}
