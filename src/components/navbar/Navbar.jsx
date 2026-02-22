import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";
import { getJwtRole } from "../../utils/jwt";

const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const avatarUrl = localStorage.getItem("avatarUrl");
  const role = getJwtRole(token);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[2147483647] isolate h-16 bg-blue-700 shadow"
      style={{ position: "fixed" }}
    >
      <div className="h-full flex items-center justify-between px-4">
        {/* Brand */}
        <Link to="/" className="text-white font-bold">
          WatYouFace🎭
        </Link>

        {/* Actions */}
        {token && (
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-white text-sm max-w-[10rem] truncate">
              {username}
            </span>

            <Link to="/profile" className="text-white text-sm hover:underline">
              Profil
            </Link>

            {role === "ADMIN" && (
              <Link to="/admin" className="text-white text-sm hover:underline">
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-red-200 text-sm hover:underline"
            >
              Déconnexion
            </button>

            {/* Avatar tout à droite */}
            <Avatar size="nav" className="shrink-0 ml-2">
              <AvatarImage src={avatarSrc(avatarUrl)} />
              <AvatarFallback>
                {username?.charAt(0)?.toUpperCase() || "👤"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </nav>
  );
}