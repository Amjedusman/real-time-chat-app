const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userController = {
  index: async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword || '';

    try {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: userId } }, // Exclude current user
            {
              OR: [
                { username: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          username: true,
          profileImage: true,
          nickname: true
        },
        orderBy: {
          username: 'asc'
        },
        take: limit,
        skip: skip
      });

      const totalUsers = await prisma.user.count({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                { username: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } }
              ]
            }
          ]
        }
      });

      const response = {
        data: users,
        page: page,
        total: totalUsers,
        last_page: Math.ceil(totalUsers / limit),
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Unable to fetch users" });
    }
  },

  update: async (req, res) => {
    const userId = req.user.id;
    const pictureImage = req.file ? req.file.path : null;
    const { username, nickname } = req.body;

    let updateData = {};
    if (pictureImage) updateData.profileImage = pictureImage;
    if (username) updateData.username = username;
    if (nickname) updateData.nickname = nickname;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "Unable to update user" });
    }
  }
};

module.exports = userController;
