import { Link } from "react-router-dom";

export default function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-sm text-slate-700">
      <nav className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-3" aria-label="Liens légaux">
        <Link className="underline decoration-slate-400 underline-offset-4 hover:text-blue-800" to="/legal/terms">
          Conditions d’utilisation
        </Link>
        <Link className="underline decoration-slate-400 underline-offset-4 hover:text-blue-800" to="/legal/privacy">
          Politique de confidentialité
        </Link>
      </nav>
    </footer>
  );
}
