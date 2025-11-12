import React from "react";

export default function ChatList({
  conversations,
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
        const isGroup = conv.isGroup;
        const otherUser = !isGroup
          ? conv.participants?.find((u) => u.id !== currentUserId)
          : null;

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`relative flex items-center p-2 cursor-pointer rounded-lg mb-1 transition ${
              selectedConvId === conv.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            {/* Avatar */}
            {!isGroup ? (
              <img
                src={buildAvatarUrl(otherUser?.avatarUrl)}
                alt="avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onAvatarClick?.(otherUser);
                }}
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

            {/* Nom + dernier msg */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {isGroup ? conv.name : otherUser?.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {conv.lastMessage || "Aucun message"}
              </p>
            </div>

            {/* Pastille rouge si non lu */}
            {conv.unread && (
              <div className="absolute right-2 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
