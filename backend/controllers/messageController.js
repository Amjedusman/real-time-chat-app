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
  }
};

module.exports = messageController;
