import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";
import { api } from "../../utils/api";

const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    const refreshUser = () => {
      api.getCurrentUser()
        .then((profile) => active && setUser(profile))
        .catch(() => active && setUser(null));
    };
    refreshUser();
    window.addEventListener("watyouface:auth-change", refreshUser);
    return () => {
      active = false;
      window.removeEventListener("watyouface:auth-change", refreshUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear the local UI state even if the server is temporarily unreachable.
    } finally {
      localStorage.removeItem("username");
      localStorage.removeItem("avatarUrl");
      setUser(null);
      window.dispatchEvent(new Event("watyouface:auth-change"));
      navigate("/login");
    }
  };

  const navItemClass = ({ isActive }) =>
    `rounded px-3 py-2 text-sm font-medium transition focus-visible:outline-none ${
      isActive ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[2147483647] isolate h-16 bg-blue-700 shadow"
      style={{ position: "fixed" }}
    >
      <div className="h-full flex items-center justify-between gap-3 px-4 max-w-7xl mx-auto">
        {/* Brand */}
        <Link to="/" className="text-white font-bold">
          WatYouFace🎭
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            <NavLink to="/" end className={navItemClass}>Feed</NavLink>
            <NavLink to="/messages" className={navItemClass}>Chat</NavLink>
            <NavLink to="/marketplace" className={navItemClass}>Marketplace</NavLink>
          </div>
        )}

        {/* Actions */}
        {user && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden sm:inline text-white text-sm max-w-[10rem] truncate">
              {user.username}
            </span>

            <Link to="/profile" className="text-white text-sm rounded px-2 py-1 hover:bg-white/10 focus-visible:outline-none">
              Profil
            </Link>

            {user.role === "ADMIN" && (
              <Link to="/admin" className="hidden md:inline text-white text-sm rounded px-2 py-1 hover:bg-white/10 focus-visible:outline-none">
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-red-100 text-sm rounded px-2 py-1 hover:bg-white/10 focus-visible:outline-none"
            >
              Déconnexion
            </button>

            {/* Avatar tout à droite */}
            <Avatar size="nav" className="shrink-0 ml-2">
              <AvatarImage src={avatarSrc(user.avatarUrl)} />
              <AvatarFallback>
                {user.username?.charAt(0)?.toUpperCase() || "👤"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-[2147483647] flex justify-around border-t border-gray-200 bg-white px-2 py-1 shadow md:hidden" aria-label="Navigation mobile">
          <NavLink to="/" end className={({ isActive }) => `rounded px-3 py-2 text-sm ${isActive ? "font-bold text-blue-700" : "text-gray-700"}`}>Feed</NavLink>
          <NavLink to="/messages" className={({ isActive }) => `rounded px-3 py-2 text-sm ${isActive ? "font-bold text-blue-700" : "text-gray-700"}`}>Chat</NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => `rounded px-3 py-2 text-sm ${isActive ? "font-bold text-blue-700" : "text-gray-700"}`}>Market</NavLink>
          <NavLink to="/profile" className={({ isActive }) => `rounded px-3 py-2 text-sm ${isActive ? "font-bold text-blue-700" : "text-gray-700"}`}>Profil</NavLink>
        </div>
      )}
    </nav>
  );
}
