import React from "react";

export default function ChatList({
  conversations = [],
  users = [],
  selectedConvId,
  onSelect,
  onAvatarClick,
  currentUserId
}) {
  const buildAvatarUrl = (path) =>
    path
      ? path.startsWith("http")
        ? path
        : `http://localhost:8080${path}`
      : "http://localhost:8080/uploads/avatars/default.png";

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => {
        const isGroup = conv.group || conv.isGroup;

        const participants = Array.isArray(conv.participants)
          ? conv.participants
          : [];

        const otherUser = !isGroup
          ? participants.find((u) => u.id !== currentUserId)
          : null;

        const displayName = isGroup
          ? conv.title || "Groupe"
          : otherUser?.username || "Conversation";

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg mb-1 transition ${
              selectedConvId === conv.id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {!isGroup ? (
              <img
                src={buildAvatarUrl(otherUser?.avatarUrl)}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover shrink-0"
                onError={(e) =>
                  (e.target.src =
                    "http://localhost:8080/uploads/avatars/default.png")
                }
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                👥
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {conv.lastMessage || "Aucun message"}
              </p>
            </div>
          </div>
        );
      })}

      {/* NOUVEAUX CHATS */}
      {users.length > 0 && (
        <>
          <hr className="my-2" />
          <p className="text-xs text-gray-400 uppercase px-2 mb-1">
            👥 Nouveaux chats
          </p>

          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => onAvatarClick(user.id)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 mb-1"
            >
              <img
                src={buildAvatarUrl(user.avatarUrl)}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <p className="font-medium text-sm truncate">
                {user.username}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
