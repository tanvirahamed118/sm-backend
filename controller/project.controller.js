const Prisma = require("../config/db.connect");
const {
  QUERY_SUCCESSFUL_MESSAGE,
  DATA_NOT_FOUND_MESSAGE,
  DELETE_SUCCESSFUL_MESSAGE,
  UPDATE_SUCCESSFUL_MESSAGE,
  MEMBER_ALREADY_EXIST_MESSAGE,
  PROJECT_CREATE_SUCCESSFUL_MESSAGE,
} = require("../utils/response");
const sendNotificationMail = require("../utils/sendNotificationMail");
const { SUCCESS_STATUS, ERROR_STATUS } = require("../utils/status");

// get all project
async function getAllProjectDefault(req, res) {
  try {
    const project = await Prisma.project.findMany({
      include: {
        teamMembers: {
          include: {
            user: true,
          },
        },
        tasks: true,
        teamMembers: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      project: project,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all project
async function getAllProject(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const project = await Prisma.project.findMany({
      skip: skip,
      take: limitNumber,
      include: {
        teamMembers: {
          include: {
            user: true,
          },
        },
        tasks: true,
      },
    });
    const totalProject = await Prisma.project.count();
    const totalPage = Math.ceil(totalProject / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        project,
        totalPage,
        totalProject,
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all project
async function getAllProjectByManager(req, res) {
  const { page = 1, limit = 10, ownerId } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;
  try {
    const project = await Prisma.project.findMany({
      skip: skip,
      take: limitNumber,
      where: {
        ownerId: Number(ownerId),
      },
      include: {
        teamMembers: {
          include: {
            user: true,
          },
        },
        tasks: true,
      },
    });
    const totalProject = await Prisma.user.count();
    const totalPage = Math.ceil(totalProject / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        project,
        totalPage,
        totalProject,
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all project
async function getAllProjectByMember(req, res) {
  const { page = 1, limit = 10, assigneeId } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;
  try {
    const project = await Prisma.project.findMany({
      skip: skip,
      take: limitNumber,
      where: {
        assigneeId: Number(assigneeId),
      },
      include: {
        teamMembers: {
          include: {
            user: true,
          },
        },
        tasks: true,
      },
    });
    const totalProject = await Prisma.user.count();
    const totalPage = Math.ceil(totalProject / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        project,
        totalPage,
        totalProject,
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get single project
async function getSingleProject(req, res) {
  const { id } = req.params;
  try {
    const existProject = await Prisma.project.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        teamMembers: {
          include: {
            user: true,
          },
        },
        tasks: true,
        comments: true,
      },
    });
    if (!existProject) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      project: existProject,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// create project
async function createProject(req, res) {
  const { title, description, startDate, endDate, ownerId } = req.body;
  try {
    const file = req?.file?.originalname.split(" ").join("-");
    const basePath = `${req.protocol}://${req.get("host")}/public/`;

    const newProject = await Prisma.project.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        ownerId: Number(ownerId),
        file: file ? `${basePath}${file}` : null,
      },
    });
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(ownerId),
      },
    });
    await Prisma.notification.create({
      data: {
        userId: Number(ownerId),
        message: `You have to create a new project: ${title}`,
      },
    });
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      `You have created a new project. Project title is: ${title}. Please login to your account manage this project.`,
      "Project created successful",
      "You have received a new notification from SMARTPM"
    );
    res.status(201).json({
      status: SUCCESS_STATUS,
      message: PROJECT_CREATE_SUCCESSFUL_MESSAGE,
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// asssign team members
async function assignMember(req, res) {
  const { userId, projectId, userName, heading } = req.body;
  try {
    const existMember = await Prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (existMember) {
      return res.status(400).json({
        status: ERROR_STATUS,
        message: MEMBER_ALREADY_EXIST_MESSAGE,
      });
    }
    const newMember = await Prisma.projectMember.create({
      data: {
        userId,
        projectId,
        userName,
        heading,
      },
      include: {
        project: true,
      },
    });

    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      `You have assigned to this project: ${newMember?.project?.title}. Please login your account to check latest update.`,
      "You have assigned",
      "You have received a new notification from SMARTPM"
    );
    await Prisma.notification.create({
      data: {
        userId: Number(userId),
        message: `You have assigned to the project: ${newMember?.project?.title}`,
      },
    });
    res.status(201).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      member: newMember,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// remove assign members
async function removeAssignMembers(req, res) {
  const { userIds, projectIds } = req.body;

  try {
    const existProjectMembers = await Prisma.projectMember.findMany({
      where: {
        id: {
          in: projectIds,
        },
      },
      include: {
        project: true, // 👈 Get project title here
      },
    });

    if (!existProjectMembers || existProjectMembers.length === 0) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }

    await Promise.all(
      userIds.map(async (userId) => {
        const user = await Prisma.user.findUnique({
          where: { id: Number(userId) },
        });

        if (!user) return;

        await Promise.all(
          projectIds.map(async (projectId) => {
            const project = await Prisma.project.findUnique({
              where: { id: Number(projectId) },
            });

            if (!project) return;

            await sendNotificationMail(
              user.email,
              user.username,
              `You have been removed from this project: ${project.title}. Please login to your account to check the latest update.`,
              "You have been removed",
              "You have received a new notification from SMARTPM"
            );
          })
        );
      })
    );

    // 🛎️ Send notifications with project title
    await Promise.all(
      existProjectMembers.map((member) =>
        Prisma.notification.create({
          data: {
            userId: member.userId,
            message: `You have been removed from the project: "${member.project.title}"`,
          },
        })
      )
    );

    // 🗑️ Delete project members
    const deleteProjectMember = await Prisma.projectMember.deleteMany({
      where: {
        id: {
          in: projectIds,
        },
      },
    });

    // 🗑️ Optionally delete their tasks
    const taskData = await Prisma.task.deleteMany({
      where: {
        assigneeId: {
          in: userIds,
        },
      },
    });

    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      project: deleteProjectMember,
      task: taskData,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// remove team members
async function removeTeamMember(req, res) {
  const { id } = req.params;
  try {
    const existMember = await Prisma.projectMember.findUnique({
      where: {
        id: Number(id),
      },
    });
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(existMember?.userId),
      },
    });
    const existProject = await Prisma.project.findUnique({
      where: {
        id: Number(existMember?.projectId),
      },
    });
    if (!existMember) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await sendNotificationMail(
      existUser.email,
      existUser.username,
      `You have been removed from this project: ${existProject.title}. Please login to your account to check the latest update.`,
      "You have been removed",
      "You have received a new notification from SMARTPM"
    );
    const deleteMember = await Prisma.projectMember.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      member: deleteMember,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// update project
async function updateProject(req, res) {
  const { title, description, startDate, endDate, status } = req.body;
  const { id } = req.params;

  try {
    const existProject = await Prisma.project.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        teamMembers: true,
      },
    });

    if (!existProject) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const file = req?.file?.originalname.split(" ").join("-");
    const basePath = `${req.protocol}://${req.get("host")}/public/`;
    const updateProject = await Prisma.project.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        startDate,
        endDate,
        status,
        file: file ? `${basePath}${file}` : null,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: Number(existProject?.ownerId),
        message: `You have updated the project: ${title}`,
      },
    });
    if (existProject?.teamMembers?.length > 0) {
      await Promise.all(
        existProject.teamMembers.map((item) =>
          Prisma.notification.create({
            data: {
              userId: item?.userId,
              message: `Your manager updated the project: ${title}`,
            },
          })
        )
      );
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      project: updateProject,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// update project
async function updateProjectByAdmin(req, res) {
  const { title, description, startDate, endDate } = req.body;
  const { id } = req.params;

  try {
    const existProject = await Prisma.project.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        teamMembers: true,
      },
    });

    if (!existProject) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const file = req?.file?.originalname.split(" ").join("-");
    const basePath = `${req.protocol}://${req.get("host")}/public/`;
    const updateProject = await Prisma.project.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        startDate,
        endDate,
        file: `${basePath ? `${basePath}${file}` : "null"}`,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: existProject?.ownerId,
        message: `Your project details has been updated by admin: ${title}`,
      },
    });
    if (existProject?.teamMembers?.length > 0) {
      await Promise.all(
        existProject.teamMembers.map((item) =>
          Prisma.notification.create({
            data: {
              userId: item?.userId,
              message: `Your project details has been updated by admin: ${title}`,
            },
          })
        )
      );
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      project: updateProject,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// verify project
async function verifyProject(req, res) {
  const { id } = req.params;
  try {
    const existProject = await Prisma.project.findUnique({
      where: {
        id: Number(id),
      },
    });
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(existProject?.ownerId),
      },
    });
    if (!existProject) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const verifyProject = await Prisma.project.update({
      where: {
        id: Number(id),
      },
      data: {
        verify: true,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: existProject?.ownerId,
        message: `Your project has been verified`,
      },
    });
    await sendNotificationMail(
      existUser.email,
      existUser.username,
      `Your project has been verified. Project title is: ${existProject.title}. Please login to your account to check the latest update.`,
      "Your project has been verified",
      "You have received a new notification from SMARTPM"
    );
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      project: verifyProject,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// delete project
async function deleteProject(req, res) {
  const { id } = req.params;
  try {
    const existProject = await Prisma.project.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        teamMembers: true,
      },
    });
    if (!existProject) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(existProject?.ownerId),
      },
    });
    const deleteProject = await Prisma.project.delete({
      where: {
        id: Number(id),
      },
    });

    await Prisma.notification.create({
      data: {
        userId: existProject.ownerId,
        message: `You have deleted the project: ${existProject?.title}`,
      },
    });
    await sendNotificationMail(
      existUser.email,
      existUser.username,
      `Your project has been deleted. Project title is: ${existProject.title}. Please login to your account to check the latest update.`,
      "Your project has been deleted",
      "You have received a new notification from SMARTPM"
    );
    if (existProject?.teamMembers?.length > 0) {
      await Promise.all(
        existProject.teamMembers.map((item) =>
          Prisma.notification.create({
            data: {
              userId: item?.userId,
              message: `Your manager was deleted the project: ${existProject?.title}`,
            },
          })
        )
      );
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      project: deleteProject,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

module.exports = {
  getAllProject,
  getSingleProject,
  createProject,
  updateProject,
  deleteProject,
  assignMember,
  removeTeamMember,
  getAllProjectByManager,
  removeAssignMembers,
  updateProjectByAdmin,
  verifyProject,
  getAllProjectDefault,
  getAllProjectByMember,
};
