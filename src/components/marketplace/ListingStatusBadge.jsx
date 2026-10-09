const STATUS = {
  AVAILABLE: { label: "Disponible", className: "bg-green-50 text-green-800 border-green-200" },
  PENDING: { label: "Demande en attente", className: "bg-amber-50 text-amber-900 border-amber-200" },
  ACCEPTED: { label: "Demande acceptée", className: "bg-blue-50 text-blue-800 border-blue-200" },
  REFUSED: { label: "Demande refusée", className: "bg-red-50 text-red-800 border-red-200" },
  PAID: { label: "Paiement démo effectué", className: "bg-violet-50 text-violet-800 border-violet-200" },
  SHIPPED: { label: "Expédiée", className: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  RECEIVED: { label: "Réception confirmée", className: "bg-slate-100 text-slate-800 border-slate-300" },
};

export default function ListingStatusBadge({ status }) {
  const value = STATUS[status] || { label: status || "Statut inconnu", className: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${value.className}`}>
      {value.label}
    </span>
  );
}
