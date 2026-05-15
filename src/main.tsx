import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  </React.StrictMode>,
);
