// 세로 화면(폰)은 가로 시야가 좁아 넓게, 가로 화면(PC)은 어안처럼 퍼지지 않게 좁게.
// 카메라(CameraRig)와 별 자리 계산(StarField)이 같은 값을 써야 하늘 시점에서 2D와 같은 자리에 뜬다
export function fovFor(aspect) {
  return aspect < 1 ? 62 : 50;
}
