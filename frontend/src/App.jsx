import Stop from "./scenes/Stop.jsx";

// scene 상태로 S1~S3을 전환하는 구조는 T04에서. 지금은 S1만 보여준다.
export default function App() {
  return (
    <div className="stage">
      <Stop />
      <footer className="footer">
        <a href="#help">도움받을 곳</a>
      </footer>
    </div>
  );
}
