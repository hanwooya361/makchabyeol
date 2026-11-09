import { useEffect, useRef } from "react";
import "./HelpCard.css";

// S4 위기 안내와 S5 도움받을 곳이 쓰는 같은 목록. 번호·링크는 출시 전에 공식 페이지에서 다시 확인한다(T16).
// 마들랜은 보건복지부·생명보험사회공헌재단 지원, 한국생명존중희망재단 운영 카카오톡 채널.
const CONTACTS = [
  { action: "109에 전화하기", note: "자살예방상담전화 · 24시간 · 무료", href: "tel:109" },
  {
    action: "글로 상담하기 (마들랜)",
    note: "카카오톡 SNS 상담 · 24시간 · 무료 · 새 창에서 열려요",
    href: "https://pf.kakao.com/_DAxbYG/chat",
  },
  { action: "1577-0199에 전화하기", note: "정신건강위기상담 · 24시간", href: "tel:15770199" },
  { action: "1388에 전화하기", note: "청소년상담 · 24시간", href: "tel:1388" },
];

/**
 * 모든 장면 위에 겹쳐 뜨는 안내 카드. 장면이 아니라 공통 UI라서 3D로 바꿔도 HTML로 남는다.
 * variant: "crisis"(S4, 위기 키워드 감지) | "help"(S5, 푸터에서 언제든)
 *
 * 입력을 막거나 지우지 않고 별도 그대로 떠 있다(설계 2장 S4).
 */
export default function HelpCard({ variant, onClose }) {
  const dialog = useRef(null);

  // 네이티브 모달이 포커스 트랩·Esc 닫기·backdrop을 대신해 준다. 열릴 때만 그려지니 마운트에서 한 번
  useEffect(() => dialog.current.showModal(), []);

  const crisis = variant === "crisis";
  const contacts = crisis ? CONTACTS.slice(0, 2) : CONTACTS;

  return (
    <dialog className="help" ref={dialog} onClose={onClose} aria-labelledby="help-title">
      <h2 className="help__title" id="help-title">
        {crisis ? "많이 힘든 밤이죠." : "도움받을 곳"}
      </h2>
      <p className="help__body">
        {crisis
          ? "지금 이야기 들어줄 사람이 있어요. 24시간, 무료예요."
          : "전화가 어렵다면 글로 이야기해도 돼요. 모두 24시간, 무료예요."}
      </p>

      <ul className="help__list">
        {contacts.map((contact) => {
          const external = contact.href.startsWith("http");
          return (
            <li key={contact.href}>
              <a
                className="help__action"
                href={contact.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {contact.action}
                <span className="help__note">{contact.note}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <button className="help__close" type="button" onClick={onClose}>
        {crisis ? "괜찮아요, 닫을게요" : "닫을게요"}
      </button>
    </dialog>
  );
}
