package com.makchabyeol.star;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/** 서버로 가는 건 익명 ID 하나뿐이다. 걱정 원문은 브라우저를 떠나지 않는다. */
public record StarRequest(@NotNull UUID visitorId) {}
