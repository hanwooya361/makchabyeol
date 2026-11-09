package com.makchabyeol.star;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StarRepository extends JpaRepository<Star, Long> {

    long countByNightDate(LocalDate nightDate);

    /** 최근 것부터. 하늘에 그릴 별은 300개까지만 내려보낸다(docs/tech-design.md 4장). */
    List<Star> findByNightDateOrderByIdDesc(LocalDate nightDate, Limit limit);
}
