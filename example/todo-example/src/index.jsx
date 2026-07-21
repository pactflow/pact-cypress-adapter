import React from "react";
// biome-ignore lint/style/useNamingConvention: ReactDOM is the canonical import name documented by React itself; renaming it would be nonstandard.
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
