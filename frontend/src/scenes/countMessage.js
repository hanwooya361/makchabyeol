// 오늘 밤 별 개수 문구. 하늘(S3)과 집 도착(S7)이 같이 쓴다.
// 숫자가 아직 없을 때도 할 말이 있어야 한다. 기다리는 동안 화면이 비어 있으면 더 외롭다
export function countMessage(night, slow) {
  if (!night) return slow ? "오늘 밤에도 별이 뜨고 있어요." : null;
  if (night.starCount < 5) return "오늘 밤 첫 별들 중 하나예요.";
  return `오늘 밤 별 ${night.starCount}개가 떴어요. 혼자 기다리는 거 아니에요.`;
}
