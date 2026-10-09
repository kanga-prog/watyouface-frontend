import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { api } from "../utils/api";

export default function Messages() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, loadedConversations, loadedUsers] = await Promise.all([
        api.getProfile(),
        api.getConversations(),
        api.getUsers(),
      ]);
      setCurrentUser(profile);
      setConversations(Array.isArray(loadedConversations) ? loadedConversations : []);
      setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
    } catch (loadError) {
      if (/\(401\)/.test(loadError.message)) {
        navigate("/login");
        return;
      }
      setError("La messagerie est indisponible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
    // Initial load only; manual retry is explicit to avoid unnecessary polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrCreateConversation = async (userId) => {
    setError(null);
    try {
      const conversation = await api.getOrCreateConversation(userId);
      setConversations((previous) => (
        previous.some((item) => item.id === conversation.id)
          ? previous
          : [conversation, ...previous]
      ));
      setSelectedConvId(conversation.id);
    } catch {
      setError("Impossible d’ouvrir cette conversation.");
    }
  };

  const hasSelection = selectedConvId !== null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] p-3 sm:p-5">
      <header className="mx-auto mb-3 flex max-w-6xl items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Messagerie</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Échangez avec les membres de la communauté.</p>
        </div>
        <button type="button" onClick={loadChat} className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-white" disabled={loading}>
          Actualiser
        </button>
      </header>

      {error && (
        <div role="alert" className="mx-auto mb-3 max-w-6xl rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <p role="status" className="mx-auto max-w-6xl rounded-lg bg-white p-6 text-center text-[var(--color-text-secondary)]">Chargement des conversations…</p>
      ) : (
        <div className="mx-auto grid min-h-[calc(100vh-11rem)] max-w-6xl overflow-hidden rounded-xl border bg-white shadow-sm md:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className={hasSelection ? "hidden border-r md:block" : "border-r"} aria-label="Liste des conversations">
            <ChatList
              conversations={conversations}
              users={users.filter((user) => user.id !== currentUser?.id)}
              selectedConvId={selectedConvId}
              onSelect={setSelectedConvId}
              onAvatarClick={getOrCreateConversation}
              currentUserId={currentUser?.id}
            />
          </aside>

          <section className={hasSelection ? "flex min-h-0 flex-col" : "hidden min-h-0 flex-col md:flex"} aria-label="Conversation active">
            {hasSelection ? (
              <>
                <button type="button" className="border-b px-4 py-3 text-left text-sm font-medium md:hidden" onClick={() => setSelectedConvId(null)}>
                  ← Retour aux conversations
                </button>
                <ChatWindow convId={selectedConvId} username={currentUser?.username} />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
                Sélectionnez une conversation pour afficher son historique.
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
