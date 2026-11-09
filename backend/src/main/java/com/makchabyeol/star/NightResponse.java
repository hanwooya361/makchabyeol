package com.makchabyeol.star;

import java.time.LocalDate;
import java.util.List;

/** 오늘 밤 하늘. 별에는 누가 띄웠는지도, 언제인지도 붙지 않는다. */
public record NightResponse(LocalDate nightDate, long starCount, List<Point> stars) {

    public record Point(short x, short y, short hue) {}
}
