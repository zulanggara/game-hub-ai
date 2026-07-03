import { HashRouter, Route, Routes } from "react-router-dom";
import { ProfileProvider } from "./lib/profile";
import { ThemeProvider } from "./lib/theme";
import { AmbientMusicProvider } from "./lib/ambientMusic";
import { SiteHeader } from "./components/SiteHeader";
import { Hub } from "./pages/Hub";
import { OdinPage } from "./games/odin/OdinPage";
import "./games/odin/index";

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <AmbientMusicProvider>
          <HashRouter>
            <SiteHeader />
            <Routes>
              <Route path="/" element={<Hub />} />
              <Route path="/play/odin" element={<OdinPage />} />
            </Routes>
          </HashRouter>
        </AmbientMusicProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
