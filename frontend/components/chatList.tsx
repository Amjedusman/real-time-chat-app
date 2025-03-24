import { useAuth } from "@/hooks/useAuth";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import MembersSearch from "@/components/membersSearch";
import { Chat } from "@/types/chatTypes";

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
}

const ChatList = ({ chats, onSelectChat }: ChatListProps) => {
  const { user } = useAuth();

  // Sort chats by most recent message
  const sortedChats = [...chats].sort((a, b) => {
    // If there are no messages in either chat
    if (!a.messages.length && !b.messages.length) return 0;
    // If one chat has no messages, put it at the bottom
    if (!a.messages.length) return 1;
    if (!b.messages.length) return -1;
    
    // Compare the timestamps of the last messages
    const aLastMessage = a.messages[a.messages.length - 1];
    const bLastMessage = b.messages[b.messages.length - 1];
    
    return new Date(bLastMessage.createdAt).getTime() - new Date(aLastMessage.createdAt).getTime();
  });

  return (
    <nav className="grid gap-4 p-4">
      <MembersSearch />
      <div className="flex items-center gap-2 bg-gray-200 rounded-md p-2">
        <Avatar>
          <AvatarImage alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="font-semibold">{user?.username}</div>
          <div className="line-clamp-1 text-xs">{user?.email}</div>
        </div>
      </div>
      {sortedChats.map((chat: Chat) => {
        return (
          <div
            key={chat.chatId}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelectChat(chat)}
          >
            <Avatar>
              <AvatarImage alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{chat.participantUsername}</div>
              <div className="line-clamp-1 text-xs">
                {chat.lastMessage ?? "No messages"}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default ChatList;
