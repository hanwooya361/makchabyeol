package com.makchabyeol.cardtap;

import com.makchabyeol.common.NightDate;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class CardTapService {

    private final CardTapRepository taps;

    public CardTapService(CardTapRepository taps) {
        this.taps = taps;
    }

    /**
     * 먼저 조회하지 않고 바로 넣는다. 조회-후-저장은 쿼리가 두 번인 데다, 같은 사람이 두 번
     * 연타하면 둘 다 "없음"을 보고 통과해 500이 난다. 유일성 판정은 DB에게 맡기고
     * 제약 위반을 "오늘은 이미 찍었다"로 번역한다.
     *
     * <p>@Transactional을 걸지 않는 이유: 저장 하나뿐이라 save가 자기 트랜잭션을 열고 닫는다.
     * 바깥에 트랜잭션이 있으면 제약 위반 뒤 그 트랜잭션이 롤백 전용이 되어 잡아도 소용이 없다.
     */
    public CardTapResponse tap(UUID visitorId) {
        LocalDate tonight = NightDate.of(Instant.now());
        try {
            taps.save(new CardTap(visitorId, tonight));
            return new CardTapResponse(tonight, true);
        } catch (DataIntegrityViolationException alreadyTappedTonight) {
            return new CardTapResponse(tonight, false);
        }
    }
}
