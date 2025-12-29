// src/utils/marketplaceApi.js
/**
 * marketplaceApi - wrapper robuste pour toutes les requêtes Marketplace
 *
 * Caractéristiques :
 * - centralise base URL
 * - auth header (read token from localStorage "token")
 * - tentative automatique de refresh token via /api/auth/refresh si 401 (utilise "refreshToken" dans localStorage)
 * - timeout via AbortController (par défaut 15s)
 * - retry (exponential backoff) pour erreurs réseau/transitoires
 * - gestion multipart/form-data (ne pas fixer Content-Type)
 * - erreurs normalisées (throw ApiError)
 *
 * Usage:
 * import { marketplaceApi } from "@/utils/marketplaceApi";
 * await marketplaceApi.getListings();
 */

const DEFAULT_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

class ApiError extends Error {
  constructor(message, { status = null, raw = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.raw = raw;
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export const marketplaceApi = (() => {
  let BASE = DEFAULT_BASE;
  let onAuthFail = null; // callback when refresh fails

  const setBaseUrl = (url) => {
    BASE = url;
  };

  const setOnAuthFail = (cb) => {
    onAuthFail = cb;
  };

  const getToken = () => localStorage.getItem("token");
  const getRefreshToken = () => localStorage.getItem("refreshToken");

  // Attempt to refresh token. Expects endpoint POST /api/auth/refresh that returns { token, refreshToken?, ... }
  async function attemptRefresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        return true;
      }
      return false;
    } catch (err) {
      console.warn("refresh failed:", err);
      return false;
    }
  }

  // low-level request helper
  async function request(path, { method = "GET", headers = {}, body = null, timeout = 15000, retries = 2, expectJson = true } = {}) {
    const url = path.startsWith("http") ? path : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

    // If body is FormData, don't set content-type (browser will set boundary).
    const isForm = body instanceof FormData;

    const authHeader = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};
    const baseHeaders = isForm ? { ...authHeader, ...headers } : { "Content-Type": "application/json", ...authHeader, ...headers };

    let attempt = 0;
    let lastErr = null;
    let shouldRefreshOn401 = true;

    while (attempt <= retries) {
      attempt += 1;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(url, {
          method,
          headers: baseHeaders,
          body: isForm ? body : body && typeof body === "object" ? JSON.stringify(body) : body,
          signal: controller.signal,
        });
        clearTimeout(id);

        if (res.status === 401 && shouldRefreshOn401) {
          // try refresh token once
          shouldRefreshOn401 = false;
          const refreshed = await attemptRefresh();
          if (refreshed) {
            // update auth header for next try
            const newAuth = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};
            if (isForm) {
              // replace auth header in baseHeaders object (mutating local variable)
              baseHeaders.Authorization = newAuth.Authorization;
            } else {
              baseHeaders["Authorization"] = newAuth.Authorization;
            }
            // retry immediately (without incrementing attempt unfairly)
            continue;
          } else {
            // refresh failed -> call onAuthFail (ex: redirect to login) and throw
            if (typeof onAuthFail === "function") onAuthFail();
            throw new ApiError("Authentification requise", { status: 401 });
          }
        }

        // handle other non-ok
        if (!res.ok) {
          const contentType = res.headers.get("content-type") || "";
          let payload = null;
          try {
            if (contentType.includes("application/json")) payload = await res.json();
            else payload = await res.text();
          } catch (e) {
            payload = null;
          }
          throw new ApiError(payload?.message || `Request failed: ${res.status}`, { status: res.status, raw: payload });
        }

        // success
        if (!expectJson) return res;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          return await res.json();
        } else {
          // if server returned e.g. text or blob
          return await res.text();
        }
      } catch (err) {
        clearTimeout(id);
        lastErr = err;
        // AbortError or network error -> retry
        const isAbort = err.name === "AbortError";
        const isNetwork = err instanceof TypeError || err.message?.toLowerCase?.().includes("network");
        if ((isAbort || isNetwork) && attempt <= retries) {
          // exponential backoff
          await sleep(200 * Math.pow(2, attempt - 1));
          continue;
        }

        // ApiError thrown above -> rethrow
        if (err instanceof ApiError) throw err;

        // otherwise wrap and throw
        throw new ApiError(err.message || "Network error", { status: null, raw: err });
      }
    }

    // If we exhausted retries
    throw new ApiError(lastErr?.message || "Request failed after retries", { raw: lastErr });
  }

  // --------------------
  // Marketplace endpoints
  // --------------------

  const getListings = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return await request(`/api/marketplace/listings${qs ? `?${qs}` : ""}`, { method: "GET" });
  };

  const getListing = async (listingId) => {
    return await request(`/api/marketplace/listings/${listingId}`, { method: "GET" });
  };

  const createListing = async (form) => {
    // form expected as { title, description, price, currency, files: [File], metadata: {...} }
    const fd = new FormData();
    if (form.title) fd.append("title", form.title);
    if (form.description) fd.append("description", form.description);
    if (form.price != null) fd.append("price", String(form.price));
    if (form.currency) fd.append("currency", form.currency);
    if (form.category) fd.append("category", form.category);
    if (form.metadata) fd.append("metadata", JSON.stringify(form.metadata));
    if (form.files && Array.isArray(form.files)) {
      form.files.forEach((f, i) => fd.append("files", f)); // backend should accept multiple files under "files"
    }
    return await request(`/api/marketplace/listings`, {
      method: "POST",
      body: fd,
      expectJson: true,
      // for FormData we pass no Content-Type (handled automatically)
    });
  };

  const updateListing = async (listingId, updates = {}) => {
    // if updates contains files -> use FormData, otherwise JSON
    if (updates.files) {
      const fd = new FormData();
      Object.entries(updates).forEach(([k, v]) => {
        if (k === "files" && Array.isArray(v)) v.forEach((f) => fd.append("files", f));
        else if (v !== undefined && v !== null) fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
      });
      return await request(`/api/marketplace/listings/${listingId}`, { method: "PUT", body: fd, expectJson: true });
    }
    return await request(`/api/marketplace/listings/${listingId}`, { method: "PUT", body: updates, expectJson: true });
  };

  const deleteListing = async (listingId) => {
    return await request(`/api/marketplace/listings/${listingId}`, { method: "DELETE", expectJson: true });
  };

  const uploadListingImage = async (listingId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return await request(`/api/marketplace/listings/${listingId}/image`, { method: "POST", body: fd, expectJson: true });
  };

  const searchListings = async (query, options = {}) => {
    const params = { q: query, ...options };
    return await getListings(params);
  };

  // Contact seller: create or get conversation and return its id
  const contactSeller = async (sellerUserId) => {
    // reuse marketplace messaging path that should create a conversation
    return await request(`/api/marketplace/contact/${sellerUserId}`, { method: "POST" });
  };

  const getListingChats = async (listingId) => {
    return await request(`/api/marketplace/listings/${listingId}/conversations`, { method: "GET" });
  };

  // export public API
  return {
    // config
    setBaseUrl,
    setOnAuthFail,

    // low-level
    request,

    // marketplace
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing,
    uploadListingImage,
    searchListings,
    contactSeller,
    getListingChats,
  };
})();
