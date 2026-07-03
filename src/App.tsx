import { HashRouter, Route, Routes } from "react-router-dom";
import { ProfileProvider } from "./lib/profile";
import { ThemeProvider } from "./lib/theme";
import { AmbientMusicProvider } from "./lib/ambientMusic";
import { SiteHeader } from "./components/SiteHeader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Hub } from "./pages/Hub";
import { OdinPage } from "./games/odin/OdinPage";
import { TactaPage } from "./games/tacta/TactaPage";
import "./games/odin/index";
import "./games/tacta/index";

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <AmbientMusicProvider>
          <HashRouter>
            <SiteHeader />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Hub />} />
                <Route path="/play/odin" element={<OdinPage />} />
                <Route path="/play/tacta" element={<TactaPage />} />
              </Routes>
            </ErrorBoundary>
          </HashRouter>
        </AmbientMusicProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
