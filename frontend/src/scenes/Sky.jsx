import { useEffect, useRef, useState } from "react";
import "./Sky.css";
import { countMessage } from "./countMessage.js";

// 예시는 돌려 가며 하나만 보여 준다. 매번 같은 문장이면 "이런 걸 쓰라는 건가" 싶어진다
const PLACEHOLDERS = [
  "내일 발표가 무서워요",
  "요즘 잠이 잘 안 와요",
  "아무한테도 말 못 한 게 있어요",
  "다들 앞서가는 것 같아요",
];

const MAX_LENGTH = 100;
const COUNT_FROM = 80;

function pickPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

/**
 * S2 하늘·입력과 S3 별이 뜬 하늘. 같은 하늘이라 한 장면으로 두고 phase로 바꾼다.
 * phase: "ask"(입력) → "releasing"(띄우는 중) → "done"(내 별 고정)
 *
 * 걱정 원문은 이 컴포넌트의 state에만 있다가 onRelease로 한 번 올라가고 끝난다.
 * 서버로 보내는 건 App이 하고, 보내는 건 익명 ID뿐이다.
 */
export default function Sky({
  inert,
  phase,
  released,
  faint,
  night,
  slow,
  onRelease,
  onSkip,
  onBackToStop,
}) {
  const [text, setText] = useState("");
  const [placeholder] = useState(pickPlaceholder);
  const input = useRef(null);
  const back = useRef(null);

  // 하늘이 보이게 되거나 별이 다 뜨면 그 단계의 첫 동작으로 포커스를 옮긴다. 장면이 바뀌어도
  // 키보드·스크린리더 사용자가 길을 잃지 않게. 띄우는 중에는 누를 게 없으니 두고,
  // 위기 카드가 같이 뜨면 카드가 포커스를 가져갔다가 닫힐 때 "다시 정류장으로"로 돌려준다
  useEffect(() => {
    if (inert || phase === "releasing") return;
    (phase === "done" ? back : input).current.focus({ preventScroll: true });
  }, [inert, phase]);

  const remaining = MAX_LENGTH - text.length;
  const asking = phase === "ask";
  const counted = countMessage(night, slow);

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    onRelease(text);
  }

  return (
    <section className={`scene scene--sky is-${phase}`} inert={inert}>
      {/* 다른 사람들의 별. 좌표는 서버가 준 천분율이라 화면 크기와 상관없이 같은 자리에 뜬다 */}
      {phase === "done" && night && (
        <div className="sky__others" aria-hidden="true">
          {night.stars.map((star, index) => (
            <span
              key={index}
              className="sky__other-star"
              style={{
                left: `${star.x / 10}%`,
                top: `${star.y / 10}%`,
                background: `hsl(${star.hue} 70% 88%)`,
              }}
            />
          ))}
        </div>
      )}

      {phase !== "done" && (
        <form className="sky__form" onSubmit={handleSubmit}>
          <p className="sky__prompt">버스 오기 전에, 걱정 하나 맡기고 갈래요?</p>

          <label className="sky__field">
            <span className="sky__label">걱정 한 줄</span>
            <input
              className="sky__input"
              ref={input}
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={MAX_LENGTH}
              placeholder={placeholder}
              autoComplete="off"
              disabled={!asking}
            />
          </label>

          {/* 남은 글자는 80자부터만 보여 준다. 처음부터 세면 글자 수를 의식하게 된다 */}
          <p className="sky__count" aria-live="polite">
            {text.length >= COUNT_FROM ? `${remaining}자 남았어요` : ""}
          </p>

          <button className="sky__submit" type="submit" disabled={!asking || !text.trim()}>
            맡기기
          </button>

          <p className="sky__note">여기 쓴 글은 아무에게도 보이지 않아요. 저장도 하지 않아요.</p>

          <button className="sky__skip" type="button" onClick={onSkip} disabled={!asking}>
            그냥 볼게요
          </button>
        </form>
      )}

      {/* 내 별. 올라가는 동안에도, 다 올라간 뒤에도 같은 자리에 있다 */}
      {released && phase !== "ask" && (
        // "오늘은 맡길 게 없어요"를 고르면 글 없이 희미한 별 하나(T22.5)
        <span className={faint ? "sky__my-star is-faint" : "sky__my-star"} aria-hidden="true" />
      )}

      {phase === "done" && (
        <div className="sky__after">
          {/* 숫자가 늦게 오거나 끝내 안 와도 자리만 지키고 있다가 조용히 채워진다 */}
          <p className="sky__count-message" aria-live="polite">
            {counted ?? (
              <>
                오늘 밤 별 <span className="sky__dots">···</span>개가 떴어요.
              </>
            )}
          </p>
          <p className="sky__closing">
            {released ? "내일 또 와요." : "괜찮아요. 그냥 앉아 있다 가도 돼요."}
          </p>
          <button className="sky__back" type="button" ref={back} onClick={onBackToStop}>
            다시 정류장으로
          </button>
        </div>
      )}
    </section>
  );
}
