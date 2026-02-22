import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Contract from "./pages/Contract";
import Admin from "./pages/Admin";

import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Layout global : Navbar fixed + padding top */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contract" element={<Contract />} />
        </Route>

        {/* Pages publiques sans layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}