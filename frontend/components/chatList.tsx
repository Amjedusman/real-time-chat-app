import { useAuth } from "@/hooks/useAuth";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import MembersSearch from "@/components/membersSearch";
import { Chat } from "@/types/chatTypes";

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  selectedChat: Chat | null;
}

const ChatList = ({ chats, onSelectChat, selectedChat }: ChatListProps) => {
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
        const isSelected = selectedChat?.chatId === chat.chatId;
        return (
          <div
            key={chat.chatId}
            className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors duration-200 ${
              isSelected 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectChat(chat)}
          >
            <Avatar>
              <AvatarImage alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{chat.participantUsername}</div>
              <div className={`line-clamp-1 text-xs ${
                isSelected ? 'text-gray-300' : 'text-gray-500'
              }`}>
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
