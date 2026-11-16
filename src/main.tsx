import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./mobile.css"
import { App } from "./App"
import { UpdateNotice } from "./components/UpdateNotice"
import { followColorScheme } from "./lib/followColorScheme"
import { preventPageZoom } from "./lib/preventPageZoom"

preventPageZoom()
followColorScheme()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <UpdateNotice />
  </StrictMode>,
)
