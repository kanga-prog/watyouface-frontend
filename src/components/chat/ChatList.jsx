import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

export default function ChatList({
  conversations = [],
  users = [],
  selectedConvId,
  onSelect,
  onAvatarClick,
  currentUserId,
}) {
  return (
    <div className="flex flex-col p-2">

      {/* Conversations existantes */}
      {conversations.length === 0 && (
        <p className="px-2 py-4 text-sm text-gray-500">Aucune conversation pour le moment.</p>
      )}
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
          <button
            type="button"
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            aria-pressed={selectedConvId === conv.id}
            className={`flex w-full items-center gap-3 p-2 text-left rounded-lg mb-1 transition focus-visible:z-10 ${
              selectedConvId === conv.id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {!isGroup ? (
              <Avatar size="chat" className="shrink-0">
                <AvatarImage src={avatarSrc(otherUser?.avatarUrl)} />
                <AvatarFallback>👤</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                👥
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">
                {conv.lastMessage || "Aucun message"}
              </p>
            </div>
          </button>
        );
      })}

      {/* Nouveaux chats */}
      {users.length > 0 && (
        <>
          <hr className="my-2" />
          <p className="text-xs text-gray-400 uppercase px-2 mb-1">
            👥 Nouveaux chats
          </p>

          {users.map((user) => (
            <button
              type="button"
              key={user.id}
              onClick={() => onAvatarClick(user.id)}
              className="flex w-full items-center gap-3 p-2 rounded-lg text-left hover:bg-gray-100 mb-1"
            >
              <Avatar size="chat" className="shrink-0">
                <AvatarImage src={avatarSrc(user.avatarUrl)} />
                <AvatarFallback>👤</AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm truncate">{user.username}</p>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
