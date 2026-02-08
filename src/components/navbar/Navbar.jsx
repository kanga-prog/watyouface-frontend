import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media"; // <-- corrigé

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const avatarUrl = localStorage.getItem("avatarUrl");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-blue-700 shadow z-50">
      <div className="flex justify-between items-center px-4 py-2">
        <Link to="/" className="text-white font-bold">
          WatYouFace
        </Link>

        {token && (
          <div className="flex items-center gap-2">
            <Avatar className="w-4 h-4">
              <AvatarImage src={avatarUrl ? mediaUrl(avatarUrl) : defaultAvatar} />
              <AvatarFallback>
                {username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <span className="text-white text-sm">{username}</span>

            <Link to="/profile" className="text-white text-sm">
              Profil
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-200 text-sm"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
