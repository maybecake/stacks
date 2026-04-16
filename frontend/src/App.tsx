import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GamePage, Greetings, Home, InviteManager, Learner, Samples } from "@features/index";
import { Header } from "@components/Header";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/samples" element={<Samples />} />
            <Route path="/samples/:count" element={<Samples />} />
            <Route path="/learner" element={<Learner />} />
            <Route path="/greetings" element={<Greetings />} />
            <Route path="/invite" element={<InviteManager />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
