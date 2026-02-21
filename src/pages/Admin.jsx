import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { getJwtRole } from "../utils/jwt";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = useMemo(() => getJwtRole(token), [token]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletePostId, setDeletePostId] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [deleteListingId, setDeleteListingId] = useState("");

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "ADMIN") return navigate("/");

    (async () => {
      try {
        const data = await api.adminGetUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Erreur admin");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, role, navigate]);

  const refreshUsers = async () => {
    const data = await api.adminGetUsers();
    setUsers(Array.isArray(data) ? data : []);
  };

  const setRole = async (userId, nextRole) => {
    await api.adminSetUserRole(userId, nextRole);
    await refreshUsers();
  };

  const del = async (kind) => {
    if (kind === "post" && deletePostId) {
      await api.adminDeletePost(deletePostId);
      setDeletePostId("");
      return;
    }
    if (kind === "comment" && deleteCommentId) {
      await api.adminDeleteComment(deleteCommentId);
      setDeleteCommentId("");
      return;
    }
    if (kind === "listing" && deleteListingId) {
      await api.adminDeleteListing(deleteListingId);
      setDeleteListingId("");
      return;
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Utilisateurs</h2>

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
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.id}</td>
                    <td>{u.username}</td>
                    <td className="text-gray-600">{u.email}</td>
                    <td className="font-mono">{u.role}</td>
                    <td className="py-2 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRole(u.id, "USER")}
                        disabled={u.role === "USER"}
                      >
                        USER
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRole(u.id, "ADMIN")}
                        disabled={u.role === "ADMIN"}
                      >
                        ADMIN
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">Modération rapide (suppression par ID)</h2>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Supprimer Post</p>
            <div className="flex gap-2">
              <Input value={deletePostId} onChange={(e) => setDeletePostId(e.target.value)} placeholder="postId" />
              <Button onClick={() => del("post")} disabled={!deletePostId}>OK</Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Supprimer Commentaire</p>
            <div className="flex gap-2">
              <Input value={deleteCommentId} onChange={(e) => setDeleteCommentId(e.target.value)} placeholder="commentId" />
              <Button onClick={() => del("comment")} disabled={!deleteCommentId}>OK</Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Supprimer Listing</p>
            <div className="flex gap-2">
              <Input value={deleteListingId} onChange={(e) => setDeleteListingId(e.target.value)} placeholder="listingId" />
              <Button onClick={() => del("listing")} disabled={!deleteListingId}>OK</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
