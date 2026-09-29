import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Splash (index.html): fades once React has taken over. On a session's first
// visit it waits for the orbit to finish drawing; after that it only shows
// while the app is actually loading.
const splash = document.getElementById("splash");
if (splash) {
  const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const hold = splash.hasAttribute("data-first") && !still ? 1150 : 0;
  setTimeout(() => {
    splash.classList.add("splash-out");
    setTimeout(() => splash.remove(), 500);
  }, Math.max(0, hold - performance.now()));
}
