import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { mediaUrl } from "../utils/media";

export default function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [listings, setListings] = useState([]);
  const [walletAmounts, setWalletAmounts] = useState({});
  const [actionLoading, setActionLoading] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    api.getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (user.role !== "ADMIN") {
          navigate("/");
          return;
        }
        setCurrentUser(user);
      })
      .catch(() => navigate("/login"));
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    api.adminGetUsers({ query, page, size })
      .then((data) => {
        if (!active) return;
        const content = Array.isArray(data) ? data : data.content;
        setUsers(Array.isArray(content) ? content : []);
        setTotalPages(data?.totalPages ?? 0);
        setTotalElements(data?.totalElements ?? 0);
      })
      .catch((e) => setError(e?.message || "Erreur admin"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [currentUser, page]);

  // recherche (debounce)
  useEffect(() => {
    if (!currentUser) return undefined;
    const t = setTimeout(() => {
      setPage(0);
      refreshUsers({ q: query, p: 0 }).catch((e) => setError(e?.message || "Erreur admin"));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentUser]);

  const refreshUsers = async ({ q = query, p = page } = {}) => {
    const data = await api.adminGetUsers({ query: q, page: p, size });
    const content = Array.isArray(data) ? data : data.content;
    setUsers(Array.isArray(content) ? content : []);
    setTotalPages(data?.totalPages ?? 0);
    setTotalElements(data?.totalElements ?? 0);
  };

  const refreshModeration = async () => {
    const [postPage, commentPage, listingPage] = await Promise.all([
      api.adminGetPosts(), api.adminGetComments(), api.adminGetListings(),
    ]);
    setPosts(postPage.content || []);
    setComments(commentPage.content || []);
    setListings(listingPage.content || []);
  };

  useEffect(() => {
    if (!currentUser) return;
    refreshModeration().catch((e) => setError(e?.message || "Erreur modération"));
  }, [currentUser]);

  const deleteContent = async (kind, id) => {
    if (!window.confirm("Confirmer la suppression de cette donnée de test ou de ce contenu signalé ?")) return;
    setActionLoading(`${kind}-${id}`);
    setError("");
    try {
      const actions = { post: api.adminDeletePost, comment: api.adminDeleteComment, listing: api.adminDeleteListing };
      await actions[kind](id);
      setSuccess("Suppression effectuée.");
      await refreshModeration();
    } catch (e) {
      setError(e?.message || "Suppression impossible");
    } finally {
      setActionLoading("");
    }
  };

  const creditWallet = async (userId) => {
    const amount = Number(walletAmounts[userId]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Le montant doit être strictement positif.");
      return;
    }
    if (!window.confirm(`Créditer ${amount} crédits de démonstration ?`)) return;
    setActionLoading(`wallet-${userId}`);
    setError("");
    try {
      await api.adminCreditWallet(userId, amount);
      setSuccess("Wallet crédité.");
      setWalletAmounts((current) => ({ ...current, [userId]: "" }));
      await refreshUsers();
    } catch (e) {
      setError(e?.message || "Crédit impossible");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Panel Admin</h1>
        <Button variant="outline" onClick={refreshUsers} disabled={loading}>
          Rafraîchir
        </Button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {success && <p role="status" className="text-sm text-green-700">{success}</p>}

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Utilisateurs</h2>

        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-3">
          <Input
            aria-label="Rechercher un utilisateur par pseudo ou adresse e-mail"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Recherche username / email"
            className="md:max-w-md"
          />
          <div className="text-xs text-gray-600">{totalElements} utilisateur(s)</div>
        </div>

        {loading ? (
          <p>Chargement…</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">Aucun utilisateur</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Contrat</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.id}</td>
                    <td>{u.username}</td>
                    <td className="text-gray-600">{u.email}</td>
                    <td className="font-mono">{u.role}</td>
                    <td>{u.acceptedContract ? "Accepté" : "En attente"}</td>
                    <td className="py-2">
                      <span className="mr-2">{u.walletBalance ?? 0}</span>
                      <Input aria-label={`Montant wallet ${u.username}`} className="inline-flex w-24 mr-1" type="number" min="0.01" value={walletAmounts[u.id] || ""} onChange={(e) => setWalletAmounts((current) => ({ ...current, [u.id]: e.target.value }))} />
                      <Button size="sm" onClick={() => creditWallet(u.id)} disabled={actionLoading === `wallet-${u.id}`}>Créditer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← Précédent
            </Button>

            <div className="text-xs text-gray-600">
              Page {page + 1} / {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant →
            </Button>
          </div>
        )}
      </Card>

      <ModerationTable title="Posts" rows={posts} render={(post) => <><td>{post.id}</td><td>{post.authorUsername}<br /><span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span></td><td className="max-w-md break-words">{post.content}<MediaPreview src={post.imageUrl} /></td><td><Button size="sm" variant="destructive" onClick={() => deleteContent("post", post.id)} disabled={actionLoading === `post-${post.id}`}>Supprimer</Button></td></>} />
      <ModerationTable title="Commentaires" rows={comments} render={(comment) => <><td>{comment.id}</td><td>{comment.authorUsername}<br /><span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span></td><td className="max-w-md break-words">Post #{comment.postId} — {comment.postExcerpt}<br />{comment.content}</td><td><Button size="sm" variant="destructive" onClick={() => deleteContent("comment", comment.id)} disabled={actionLoading === `comment-${comment.id}`}>Supprimer</Button></td></>} />
      <ModerationTable title="Marketplace" rows={listings} render={(listing) => <><td>{listing.id}</td><td>{listing.sellerUsername}<br /><span className="text-xs text-gray-500">{formatDate(listing.createdAt)}</span></td><td className="max-w-md break-words">{listing.title} — {listing.price} — {listing.hidden ? "MASQUÉE" : listing.status}<MediaPreview src={listing.image} /></td><td><Button size="sm" variant="destructive" onClick={() => deleteContent("listing", listing.id)} disabled={actionLoading === `listing-${listing.id}`}>{listing.hidden ? "Masquée" : "Supprimer"}</Button></td></>} />
    </div>
  );
}

function ModerationTable({ title, rows, render }) {
  return <Card className="p-4 overflow-x-auto"><h2 className="font-semibold mb-3">{title}</h2><table className="w-full text-sm"><caption className="sr-only">Liste de modération : {title}</caption><thead><tr className="text-left border-b"><th scope="col" className="py-2">ID</th><th scope="col">Auteur et date</th><th scope="col">Contenu</th><th scope="col">Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-b"><>{render(row)}</></tr>) : <tr><td className="text-gray-500" colSpan="4">Aucune donnée</td></tr>}</tbody></table></Card>;
}

function MediaPreview({ src }) {
  return src ? <img className="mt-1 h-12 w-12 rounded object-cover" src={mediaUrl(src)} alt="Média du contenu" /> : null;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Date inconnue";
}
