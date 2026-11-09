package com.makchabyeol.cardtap;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/** 서버가 받는 건 익명 ID 하나. 몇 시에 찍었는지는 DB가 적는다. */
public record CardTapRequest(@NotNull UUID visitorId) {}
