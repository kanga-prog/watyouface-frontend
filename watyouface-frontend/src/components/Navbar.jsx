import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">WatYouFace</Link>
      <div className="flex gap-4">
        {!token ? (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        ) : (
          <>
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
