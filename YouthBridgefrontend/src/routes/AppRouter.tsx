import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import PolicyList from "../pages/PolicyList";
import PolicyDetail from "../pages/PolicyDetail";
import Recommend from "../pages/Recommend";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/policies" element={<PolicyList />} />
        <Route path="/policies/:id" element={<PolicyDetail />} />
        <Route path="/recommend" element={<Recommend />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
