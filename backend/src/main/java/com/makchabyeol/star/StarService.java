package com.makchabyeol.star;

import com.makchabyeol.common.NightDate;
import com.makchabyeol.common.RateLimitedException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StarService {

    private static final int MAX_STARS = 300;
    private static final int CACHE_SECONDS = 10;
    private static final int PER_MINUTE = 3;
    private static final int PER_NIGHT = 20;

    private final StarRepository stars;

    /**
     * 하늘은 30초마다 폴링된다(T08). 사람이 늘어도 DB를 그만큼 때리지 않도록 10초만 들고 있는다.
     * shortcut: 서버 인스턴스마다 따로 캐시한다. 인스턴스가 여러 대가 되면 Redis 같은 공용 캐시로.
     */
    private final AtomicReference<Cached> cache = new AtomicReference<>();

    private record Cached(NightResponse body, Instant expiresAt) {}

    public StarService(StarRepository stars) {
        this.stars = stars;
    }

    @Transactional(readOnly = true)
    public NightResponse night() {
        Cached hit = cache.get();
        if (hit != null && hit.expiresAt().isAfter(Instant.now())) {
            return hit.body();
        }
        NightResponse body = loadNight(NightDate.of(Instant.now()));
        cache.set(new Cached(body, Instant.now().plusSeconds(CACHE_SECONDS)));
        return body;
    }

    @Transactional
    public StarResponse create(UUID visitorId) {
        LocalDate tonight = NightDate.of(Instant.now());

        // 방문자당 1분 3개·밤 하루 20개. DB로 세니 서버가 재시작해도 풀리지 않는다.
        // 동시에 몰린 요청 몇 개가 한도를 살짝 넘을 수 있지만 도배 방지에는 충분하다
        if (stars.countByVisitorIdAndCreatedAtAfter(visitorId, Instant.now().minusSeconds(60)) >= PER_MINUTE
                || stars.countByVisitorIdAndNightDate(visitorId, tonight) >= PER_NIGHT) {
            throw RateLimitedException.stars();
        }

        // 위치와 색은 서버가 정한다. 클라이언트가 좌표를 보내면 누군가 하늘에 글자를 그릴 수 있다
        ThreadLocalRandom random = ThreadLocalRandom.current();
        Star star =
                new Star(
                        visitorId,
                        tonight,
                        (short) random.nextInt(0, 1001),
                        (short) random.nextInt(0, 1001),
                        (short) random.nextInt(0, 360));
        stars.save(star);

        // 방금 뜬 별이 다음 조회에 바로 보이도록 캐시를 버린다
        cache.set(null);

        return new StarResponse(
                star.getId(),
                star.getPosX(),
                star.getPosY(),
                star.getHue(),
                stars.countByNightDate(tonight));
    }

    private NightResponse loadNight(LocalDate tonight) {
        List<NightResponse.Point> points =
                stars.findByNightDateOrderByIdDesc(tonight, Limit.of(MAX_STARS)).stream()
                        .map(s -> new NightResponse.Point(s.getPosX(), s.getPosY(), s.getHue()))
                        .toList();
        return new NightResponse(tonight, stars.countByNightDate(tonight), points);
    }
}
