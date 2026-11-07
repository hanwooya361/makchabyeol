// T01 뼈대: 실행되는 빈 화면까지만. 장면 전환(scene 상태)은 T02~T04에서 만든다.
export default function App() {
  return (
    <div className="stage">
      <main className="scene">
        <p className="placeholder">막차까지 ∞분</p>
      </main>
      <footer className="footer">
        <a href="#help">도움받을 곳</a>
      </footer>
    </div>
  );
}
