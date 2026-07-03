import { HashRouter, Route, Routes } from "react-router-dom";
import { ProfileProvider } from "./lib/profile";
import { SiteHeader } from "./components/SiteHeader";
import { Hub } from "./pages/Hub";
import { OdinPage } from "./games/odin/OdinPage";
import "./games/odin/index";

function App() {
  return (
    <ProfileProvider>
      <HashRouter>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/play/odin" element={<OdinPage />} />
        </Routes>
      </HashRouter>
    </ProfileProvider>
  );
}

export default App;
