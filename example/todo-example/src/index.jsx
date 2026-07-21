import React from "react";
// biome-ignore lint/correctness/noUnresolvedImports: react-dom/client resolves fine at runtime (CJS default export); Biome's resolver misreads its conditional exports map across the nested example node_modules.
// biome-ignore lint/style/useNamingConvention: ReactDOM is the canonical import name documented by React itself; renaming it would be nonstandard.
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
