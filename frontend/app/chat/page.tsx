"use client";

import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import Header from "@/components/header";
import ChatList from "@/components/chatList";
import ChatWindow from "@/components/chatWindow";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { BACKEND_URL } from "@/lib/config";
import { Chat } from "@/types/chatTypes";
import SendChatMessageForm from "@/components/forms/sendChatMessageForm";
import axiosInstance from "@/lib/axiosInstance";

const socket = io(BACKEND_URL);

export default function Page() {
  const { user } = useAuth();
  const { chats, chatsAreLoading, chatsHasError, mutate } = useChats();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    if (selectedChat && chats) {
      let currentSelectedChat = chats.data.find(
        (c) => selectedChat.chatId == c.chatId
      );
      console.log(currentSelectedChat);
      setSelectedChat({ ...currentSelectedChat });
    }
  }, [chats]);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      if (selectedChat && newMessage.chatId === selectedChat.chatId) {
        console.log("update chat");
        mutate();
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [selectedChat]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    const blockedChats = JSON.parse(localStorage.getItem('blockedChats') || '[]');
    setIsBlocked(blockedChats.includes(chat.chatId));
  };

  const handleBlock = async () => {
    if (selectedChat) {
      try {
        // First update local UI state
        const blockedChats = JSON.parse(localStorage.getItem('blockedChats') || '[]');
        if (!blockedChats.includes(selectedChat.chatId)) {
          blockedChats.push(selectedChat.chatId);
          localStorage.setItem('blockedChats', JSON.stringify(blockedChats));
        }
        setIsBlocked(true);
        
        // Then update the database by calling the block API
        const response = await axiosInstance.post('/api/blocks', {
          blockedId: selectedChat.participantUserId,
          reason: 'User blocked from chat',
          messageId: selectedChat.messages?.[selectedChat.messages.length - 1]?.id || null
        });
        
        console.log('Block record created:', response.data);
        
        // Optionally refresh data to show updated block counts
        mutate();
      } catch (error) {
        console.error('Error creating block record:', error);
        // You might want to show an error notification here
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r overflow-auto hidden md:block">
          {chatsAreLoading ? (
            <div>Loading...</div>
          ) : chats?.data ? (
            <ChatList chats={chats.data} onSelectChat={handleChatSelect} />
          ) : (
            <div>No chats available.</div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          {selectedChat ? (
            <>
              <ChatWindow chat={selectedChat} />
              <div className="border-t p-4">
                <SendChatMessageForm
                  selectedChat={selectedChat}
                  onMessageSent={() => mutate()}
                />
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
