import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Simulator from "./pages/Simulator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/simulator/:id" element={<Simulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;