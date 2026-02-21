// Simple JWT decoder (sans dépendance)
// ⚠️ Ne valide pas la signature. Juste pour lire le claim "role" côté UI.

export function decodeJwt(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getJwtRole(token) {
  const payload = decodeJwt(token);
  return payload?.role || null;
}
