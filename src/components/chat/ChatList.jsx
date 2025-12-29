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
            onClick={() => {
              console.log("Conversation cliquée →", conv.id);
              onSelect(conv.id);
            }}
            className={`relative flex items-center p-2 cursor-pointer rounded-lg mb-1 transition ${
              selectedConvId === conv.id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {!isGroup ? (
              <img
                src={buildAvatarUrl(otherUser?.avatarUrl)}
                alt="avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) =>
                  (e.target.src =
                    "http://localhost:8080/uploads/avatars/default.png")
                }
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                👥
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
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
          <p className="text-xs text-gray-400 uppercase px-2">
            👥 Nouveaux chats
          </p>

          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 mb-1"
              onClick={() => onAvatarClick(user.id)}
            >
              <img
                src={buildAvatarUrl(user.avatarUrl)}
                alt="avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <p className="font-medium truncate">
                {user.username}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
