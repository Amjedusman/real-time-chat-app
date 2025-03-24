import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { ChatMessage, Chat } from "@/types/chatTypes";
import SuspiciousUserAlert from "./SuspiciousUserAlert";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

interface ChatWindowProps {
  chat: Chat | null;
  onBlock: () => void;
}

const ChatWindow = ({ chat, onBlock }: ChatWindowProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [suspiciousMessage, setSuspiciousMessage] = useState<ChatMessage | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const checkToxicity = async (message: ChatMessage) => {
    try {
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
      }
    } catch (error) {
      console.error("Error checking toxicity:", error);
    }
  };

  useEffect(() => {
    if (chat?.messages) {
      chat.messages.forEach((message) => {
        checkToxicity(message);
      });
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

      {suspiciousMessage && (
        <SuspiciousUserAlert
          onBlock={() => {
            console.log("User blocked:", suspiciousMessage.senderUsername);
            onBlock();
            setSuspiciousMessage(null); // Close the alert
          }}
          onIgnore={() => {
            console.log("User ignored:", suspiciousMessage.senderUsername);
            setSuspiciousMessage(null); // Close the alert
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;
