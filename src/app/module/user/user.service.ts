import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";


const getSingleUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authProvider: true,
      status: true,
      emailVerified: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const UserService = {
  //   getAllUsers,
  //   getMyProfile,
  //   updateMyProfile,
  getSingleUser,
  //   updateUserStatus,
  //   deleteUser,
};
