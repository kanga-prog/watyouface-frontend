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
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-700 shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-white font-bold text-xl">
          WatYouFace
        </Link>

        <div className="flex gap-3 items-center">
          {token && (
            <>
              <Button variant="secondary">
                <Link to="/">Feed</Link>
              </Button>
              <Button variant="secondary">
                <Link to="/marketplace">Marketplace</Link>
              </Button>
              <Button variant="secondary">
                <Link to="/messages">Messagerie</Link>
              </Button>
            </>
          )}

          {!token ? (
            <>
              <Button variant="secondary">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button variant="secondary">
                <Link to="/register">Inscription</Link>
              </Button>
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

              <span className="text-white">{username}</span>

              <Button variant="secondary">
                <Link to="/profile">Profil</Link>
              </Button>

              <Button variant="destructive" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
