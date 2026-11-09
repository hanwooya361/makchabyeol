package com.makchabyeol.star;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StarRepository extends JpaRepository<Star, Long> {

    long countByNightDate(LocalDate nightDate);

    // 방문자당 한도용. (visitor_id, created_at) 인덱스를 탄다
    long countByVisitorIdAndCreatedAtAfter(UUID visitorId, Instant after);

    long countByVisitorIdAndNightDate(UUID visitorId, LocalDate nightDate);

    /** 최근 것부터. 하늘에 그릴 별은 300개까지만 내려보낸다(docs/tech-design.md 4장). */
    List<Star> findByNightDateOrderByIdDesc(LocalDate nightDate, Limit limit);
}
