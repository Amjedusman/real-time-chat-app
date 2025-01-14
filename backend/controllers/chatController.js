const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const chatController = {
  index: async (req, res) => {
    const userId = req.user.id;

    try {
      // First get all chats where the user is a participant
      const userChats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'asc'
            },
            include: {
              user: {
                select: {
                  username: true,
                  profileImage: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Transform the data to match the frontend expectations
      const chats = userChats.map(chat => {
        const otherParticipant = chat.participants.find(
          p => p.userId !== userId
        )?.user;

        const messages = chat.messages.map(msg => ({
          id: msg.id,
          userId: msg.userId,
          chatId: msg.chatId,
          content: msg.content,
          senderUsername: msg.user.username,
          status: msg.status,
          imageUrl: null,
          createdAt: msg.createdAt.toISOString()
        }));

        return {
          chatId: chat.id,
          participantUserId: otherParticipant?.id,
          participantUsername: otherParticipant?.username,
          lastMessage: messages[messages.length - 1]?.content || "No messages yet",
          messages: messages
        };
      });

      res.status(200).json({
        data: chats,
        page: 1,
        total: chats.length,
        last_page: 1,
      });
    } catch (error) {
      console.error("Error fetching active chats:", error);
      res.status(500).json({ error: "Unable to fetch active chats" });
    }
  }
};

module.exports = chatController;
