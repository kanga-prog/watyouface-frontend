// src/components/navbar/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const avatarUrl = localStorage.getItem("avatarUrl");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("avatarUrl");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">WatYouFace</Link>

      <div className="flex gap-4 items-center">
        {token && (
          <>
            <Link to="/">Feed</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/messages">Messagerie</Link>
          </>
        )}

        {!token ? (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              {avatarUrl ? (
                <AvatarImage src={`http://localhost:8080${avatarUrl}`} />
              ) : (
                <AvatarFallback>{username?.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium">{username}</span>
            <Link to="/profile">Profil</Link>
            <Button variant="destructive" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
