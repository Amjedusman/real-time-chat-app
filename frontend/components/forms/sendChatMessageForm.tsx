import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { Chat } from "@/types/chatTypes";

interface SendChatMessageForm {
  selectedChat: Chat;
  onMessageSent: () => void;
  isBlocked?: boolean;
}

const SendChatMessageForm = ({
  selectedChat,
  onMessageSent,
  isBlocked = false,
}: SendChatMessageForm) => {
  const { register, handleSubmit, reset } = useForm();
  const { user } = useAuth();

  const receiverId = selectedChat.participantUserId;

  const sendMessage = async (data: any) => {
    try {
      const { content }: { content: string } = data;

      if (!content.trim()) {
        return;
      }

      if (!receiverId) {
        console.error("Receiver ID is missing");
        return;
      }

      await axiosInstance.post("/api/messages", {
        content,
        receiverId,
      });

      reset();
      onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit(sendMessage)}>
      <Input 
        placeholder={
          isBlocked 
            ? `You have blocked ${selectedChat.participantUsername}. Unblock to continue conversation.` 
            : "Type a message"
        } 
        {...register("content")} 
        disabled={isBlocked}
      />
      <Button type="submit" disabled={isBlocked}>Send</Button>
    </form>
  );
};

export default SendChatMessageForm;
