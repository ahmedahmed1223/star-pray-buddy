import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initStorage } from "./lib/storage";

const root = createRoot(document.getElementById("root")!);

initStorage().finally(() => {
  root.render(<App />);
});
