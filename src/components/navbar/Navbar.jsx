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
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-blue-700 shadow">
      <div className="h-full flex justify-between items-center px-4">
        <Link to="/" className="text-white font-bold">
          WatYouFace🎭
        </Link>

        {token && (
          <div className="flex items-center gap-3">
            {/* ✅ avatar petit + ne rétrécit pas */}
            <Avatar size="2xs" className="shrink-0">
              <AvatarImage src={avatarSrc(avatarUrl)} />
              <AvatarFallback>
                {username?.charAt(0)?.toUpperCase() || "👤"}
              </AvatarFallback>
            </Avatar>

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

            <button onClick={handleLogout} className="text-red-200 text-sm hover:underline">
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}