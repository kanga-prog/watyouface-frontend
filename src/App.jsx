import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Contract from "./pages/Contract";
import Admin from "./pages/Admin";

// Nouvelles pages à créer
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        {/* ✅ Décale toutes les pages sous la navbar fixed (h-16 = 4rem) */}
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />           {/* Feed */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
