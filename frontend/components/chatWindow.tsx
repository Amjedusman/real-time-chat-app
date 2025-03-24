import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { ChatMessage, Chat } from "@/types/chatTypes";
import SuspiciousUserAlert from "./SuspiciousUserAlert";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

interface ChatWindowProps {
  chat: Chat | null;
  onBlock: () => void;
  isBlocked: boolean;
}

const ChatWindow = ({ chat, onBlock, isBlocked }: ChatWindowProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [suspiciousMessage, setSuspiciousMessage] = useState<ChatMessage | null>(null);

  // Clear suspicious message when changing chats
  useEffect(() => {
    setSuspiciousMessage(null);
  }, [chat?.chatId]);

  // Modified to store ignored messages per user
  const isMessageIgnored = (messageId: number, senderId: number) => {
    const ignoredMessages = JSON.parse(localStorage.getItem(`ignored_messages_${user?.id}`) || '{}');
    return ignoredMessages[senderId]?.includes(messageId);
  };

  const addToIgnoredMessages = (messageId: number, senderId: number) => {
    const ignoredMessages = JSON.parse(localStorage.getItem(`ignored_messages_${user?.id}`) || '{}');
    if (!ignoredMessages[senderId]) {
      ignoredMessages[senderId] = [];
    }
    ignoredMessages[senderId].push(messageId);
    localStorage.setItem(`ignored_messages_${user?.id}`, JSON.stringify(ignoredMessages));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const checkToxicity = async (message: ChatMessage) => {
    try {
      // Skip if it's our message or if it's already been ignored
      if (message.userId === user!.id || isMessageIgnored(message.id, message.userId)) return false;

      const response = await fetch("http://localhost:5000/find-toxicity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message.content,
        }),
      });
      const data = await response.json();
      console.log(data.predicted_class);
      if (data.predicted_class === "toxic") {
        setSuspiciousMessage(message);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return false;
    }
  };

  useEffect(() => {
    if (chat?.messages) {
      const checkAllMessages = async () => {
        for (const message of chat.messages) {
          if (message.userId !== user!.id && !isMessageIgnored(message.id, message.userId)) {
            const isToxic = await checkToxicity(message);
            if (isToxic) break;
          }
        }
      };
      
      checkAllMessages();
    }
  }, [chat?.messages]);

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    
    // If it's within the last 7 days, show relative time
    if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // For older messages, show the full date
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const handleUnblock = () => {
    if (chat) {
      const blockedChats = JSON.parse(localStorage.getItem('blockedChats') || '[]');
      const updatedBlockedChats = blockedChats.filter((id: number) => id !== chat.chatId);
      localStorage.setItem('blockedChats', JSON.stringify(updatedBlockedChats));
      window.location.reload(); // Refresh to update the blocked state
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex flex-col gap-4">
        {chat?.messages?.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.userId === user!.id ? "text-right self-end" : ""
            }`}
          >
            <Avatar>
              <AvatarImage alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{message.senderUsername}</div>
              <div className="line-clamp-1 text-xs">{formatMessageDate(message.createdAt)}</div>
              <div className="line-clamp-1 text-sm">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {(suspiciousMessage || isBlocked) && (
        <SuspiciousUserAlert
          onBlock={() => {
            console.log("User blocked:", suspiciousMessage?.senderUsername);
            onBlock();
            if (suspiciousMessage) {
              addToIgnoredMessages(suspiciousMessage.id, suspiciousMessage.userId);
            }
            setSuspiciousMessage(null);
          }}
          onIgnore={() => {
            console.log("User ignored:", suspiciousMessage?.senderUsername);
            if (suspiciousMessage) {
              addToIgnoredMessages(suspiciousMessage.id, suspiciousMessage.userId);
            }
            setSuspiciousMessage(null);
          }}
          isBlocked={isBlocked}
          onUnblock={handleUnblock}
        />
      )}
    </div>
  );
};

export default ChatWindow;
