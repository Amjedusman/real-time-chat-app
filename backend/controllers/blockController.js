const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const blockController = {
  create: async (req, res) => {
    const blockerId = req.user.id;
    const { blockedId, reason, messageId } = req.body;

    try {
      // Create the block record
      const blockRecord = await prisma.blockRecord.create({
        data: {
          blockerId,
          blockedId,
          reason,
          messageId
        }
      });

      // Get total blocks for the blocked user
      const totalBlocks = await prisma.blockRecord.count({
        where: {
          blockedId
        }
      });

      // Update user's block count in the database
      await prisma.user.update({
        where: { id: blockedId },
        data: { blockCount: totalBlocks }
      });

      res.status(201).json({ blockRecord, totalBlocks });
    } catch (error) {
      console.error("Error creating block record:", error);
      res.status(500).json({ error: "Failed to create block record" });
    }
  },

  getStats: async (req, res) => {
    const userId = req.params.userId;

    try {
      const stats = await prisma.blockRecord.aggregate({
        where: {
          blockedId: parseInt(userId)
        },
        _count: {
          id: true
        },
        _min: {
          createdAt: true
        },
        _max: {
          createdAt: true
        }
      });

      res.json(stats);
    } catch (error) {
      console.error("Error fetching block stats:", error);
      res.status(500).json({ error: "Failed to fetch block statistics" });
    }
  }
};

module.exports = blockController; 