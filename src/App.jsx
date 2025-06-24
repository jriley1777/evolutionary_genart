import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home/Home";
import IntroAnimation from "./IntroAnimation";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1750); // adjust to match animation length
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? <IntroAnimation /> : (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;