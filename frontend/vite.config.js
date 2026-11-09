import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 처리방침(S6)은 JS 없이 읽히고 주소로 바로 열려야 해서 앱과 따로 만든다. 배포에서는 /privacy
    rollupOptions: {
      input: { main: "index.html", privacy: "privacy.html" },
    },
  },
});
