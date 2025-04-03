const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const messageController = {
  store: async (req, res, io) => {
    const userId = req.user.id;
    const { content, receiverId } = req.body;

    try {
      // Find existing chat or create new one
      let chat = await prisma.chat.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: [userId, receiverId] }
            }
          }
        }
      });

      if (!chat) {
        // Create new chat with participants
        chat = await prisma.chat.create({
          data: {
            type: 'private',
            participants: {
              create: [
                { userId: userId },
                { userId: receiverId }
              ]
            }
          }
        });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          content,
          chatId: chat.id,
          userId: userId,
          status: 'sent'
        },
        include: {
          user: {
            select: {
              username: true,
              profileImage: true
            }
          }
        }
      });

      io.emit("newMessage", message);

      res.status(201).json({ message, chat });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  },

  fetchMessages: async (req, res) => {
    const chatId = req.params.chatId;

    try {
      // Fetch messages from the database
      const messages = await prisma.message.findMany({
        where: { chatId },
        include: {
          sender: {
            select: {
              username: true,
              blockCount: true
            }
          }
        }
      });

      // Transform the data to match the frontend structure
      const transformedMessages = messages.map(message => ({
        id: message.id,
        content: message.content,
        userId: message.senderId,
        senderUsername: message.sender.username,
        senderBlockCount: message.sender.blockCount,
        createdAt: message.createdAt
      }));

      res.status(200).json({ messages: transformedMessages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
};

module.exports = messageController;
