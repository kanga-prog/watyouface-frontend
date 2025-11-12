import { Link, useNavigate } from "react-router-dom";

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
        {!token ? (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        ) : (
          <>
            {avatarUrl && (
              <img
                src={`http://localhost:8080${avatarUrl}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
            )}
            <span className="font-medium">{username}</span>
            <Link to="/profile">Profil</Link>
            <button onClick={handleLogout} className="text-red-400">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
