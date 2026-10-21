import { useEffect, useState } from "react";
import LegalFooter from "../components/LegalFooter";
import { api } from "../utils/api";

export default function Terms() {
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getActiveContract()
      .then(async (response) => {
        if (!response.ok) throw new Error("Conditions indisponibles");
        setContract(await response.json());
      })
      .catch(() => setError("Les Conditions d’utilisation sont temporairement indisponibles."));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6" aria-labelledby="terms-title">
        <header className="space-y-2">
          <p className="text-sm font-medium text-blue-800">Document contractuel</p>
          <h1 id="terms-title" className="text-3xl font-bold text-slate-950">Conditions d’utilisation</h1>
        </header>
        {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>}
        {!error && !contract && <p>Chargement des Conditions d’utilisation…</p>}
        {contract && (
          <article className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{contract.title} — version {contract.version}</h2>
            <div className="whitespace-pre-line text-slate-700">{contract.content}</div>
          </article>
        )}
      </main>
      <LegalFooter />
    </div>
  );
}
