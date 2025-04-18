const Prisma = require("../config/db.connect");
const {
  QUERY_SUCCESSFUL_MESSAGE,
  DATA_NOT_FOUND_MESSAGE,
  UPDATE_SUCCESSFUL_MESSAGE,
  DELETE_SUCCESSFUL_MESSAGE,
  DO_NOT_CREATE_MORE_TASK_MESSAGE,
} = require("../utils/response");
const sendNotificationMail = require("../utils/sendNotificationMail");
const { SUCCESS_STATUS, ERROR_STATUS } = require("../utils/status");

// get all tasks
async function getAllTaskDefault(req, res) {
  try {
    const task = await Prisma.task.findMany({
      include: {
        messages: {
          include: {
            sender: true,
          },
        },
        owner: true,
        assignee: true,
        project: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      task: task,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all tasks
async function getAllTask(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const task = await Prisma.task.findMany({
      skip: skip,
      take: limitNumber,
      include: {
        messages: {
          include: {
            sender: true,
          },
        },
      },
    });
    const totalTask = await Prisma.task.count();
    const totalPage = Math.ceil(totalTask / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        task,
        totalPage,
        totalTask,
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

// get all tasks by member
async function getAllTasksByMember(req, res) {
  const { page = 1, limit = 10, userId } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;
  try {
    const task = await Prisma.task.findMany({
      skip: skip,
      take: limitNumber,
      where: {
        assigneeId: Number(userId),
      },
      include: {
        messages: {
          include: {
            sender: true,
          },
        },
      },
    });

    const totalTask = await Prisma.user.count();
    const totalPage = Math.ceil(totalTask / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        task,
        totalPage,
        totalTask,
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

// get all tasks
async function getSingleTask(req, res) {
  const { id } = req.params;
  try {
    const existTask = await Prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        messages: {
          include: {
            sender: true,
          },
        },
        comments: true,
        assignee: true,
        project: true,
        owner: true,
      },
    });
    if (!existTask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      task: existTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all tasks
async function createTask(req, res) {
  const {
    title,
    description,
    startDate,
    endDate,
    projectId,
    assigneeId,
    priority,
    ownerId,
  } = req.body;

  try {
    const existTask = await Prisma.task.findMany({
      where: {
        assigneeId: Number(assigneeId),
      },
    });

    if (existTask?.length >= 10) {
      return res.status(400).json({
        status: ERROR_STATUS,
        message: DO_NOT_CREATE_MORE_TASK_MESSAGE,
      });
    }

    const file = req?.file?.originalname.split(" ").join("-");
    const basePath = `${req.protocol}://${req.get("host")}/public/`;
    const newTask = await Prisma.task.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        projectId: Number(projectId),
        assigneeId: Number(assigneeId),
        priority,
        ownerId: Number(ownerId),
        file: file ? `${basePath}${file}` : null,
      },
    });
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(assigneeId),
      },
    });
    await Prisma.notification.create({
      data: {
        userId: Number(ownerId),
        message: `You have created a new task: ${title}`,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: Number(assigneeId),
        message: `You have assign a new task: ${title}`,
      },
    });
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      `You have assign a new task. Task name is: ${title}. Please login to your account manage this project.`,
      "Assign a new task",
      "You have received a new notification from SMARTPM"
    );
    res.status(201).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// update tasks priority
async function updateTaskPriority(req, res) {
  const { priority } = req.body;
  const { id } = req.params;
  try {
    const existTask = await Prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        assignee: true,
        owner: true,
      },
    });
    if (!existTask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateTask = await Prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        priority,
      },
    });

    await Prisma.notification.create({
      data: {
        userId: Number(existTask?.owner?.id),
        message: `Admin change the priority ${priority}`,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: Number(existTask?.assignee?.id),
        message: `Admin change the priority ${priority}`,
      },
    });

    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      task: updateTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// update tasks status
async function updateTaskStatus(req, res) {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const existTask = await Prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        assignee: true,
      },
    });
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(existTask.ownerId),
      },
    });
    if (!existTask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateTask = await Prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
    });
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      `${existUser?.username} update the task status:${status}. Task name is: ${existTask?.title}. Please login to your account manage this project.`,
      "Update the task status",
      "You have received a new notification from SMARTPM"
    );
    await Prisma.notification.create({
      data: {
        userId: Number(existTask?.ownerId),
        message: `${existTask?.assignee?.firstName} change the status ${status}`,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      task: updateTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// verify task
async function verifyTask(req, res) {
  const { id } = req.params;
  try {
    const existtask = await Prisma.task.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existtask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(existtask.ownerId),
      },
    });
    const verifyTask = await Prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        verify: true,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: existtask?.assigneeId,
        message: `Your task has been verified`,
      },
    });
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      `Your task has been verified. Task name is: ${existtask?.title}. Please login to your account manage this project.`,
      "Task has been verified",
      "You have received a new notification from SMARTPM"
    );
    await Prisma.notification.create({
      data: {
        userId: existtask?.ownerId,
        message: `Your task has been verified`,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      project: verifyTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// update tasks
async function updateTask(req, res) {
  const { title, description, startDate, endDate } = req.body;
  const { id } = req.params;
  try {
    const existTask = await Prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        assignee: true,
      },
    });
    if (!existTask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateTask = await Prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        startDate,
        endDate,
      },
    });
    await Prisma.notification.create({
      data: {
        userId: Number(existTask?.assignee?.id),
        message: `Your task details has been updated: ${existTask?.title}`,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      task: updateTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all tasks
async function deleteTask(req, res) {
  const { id } = req.params;
  try {
    const existTask = await Prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        assignee: true,
      },
    });
    if (!existTask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const deleteTask = await Prisma.task.delete({
      where: {
        id: Number(id),
      },
    });
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(existTask.ownerId),
      },
    });
    const existMember = await Prisma.user.findUnique({
      where: {
        id: Number(existTask.assigneeId),
      },
    });
    if (existUser) {
      await sendNotificationMail(
        existUser?.email,
        existUser?.username,
        `Your task has been deleted. Task name is: ${existTask?.title}. Please login to your account manage this project.`,
        "Task has been deleted",
        "You have received a new notification from SMARTPM"
      );
    }

    if (existMember) {
      await sendNotificationMail(
        existMember?.email,
        existMember?.username,
        `Your task has been deleted. Task name is: ${existTask?.title}. Please login to your account manage this project.`,
        "Task has been deleted",
        "You have received a new notification from SMARTPM"
      );
    }

    await Prisma.notification.create({
      data: {
        userId: Number(existTask?.assignee?.id),
        message: `Your task has been deleted: ${existTask?.title}`,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      task: deleteTask,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

module.exports = {
  getAllTask,
  getSingleTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPriority,
  updateTaskStatus,
  getAllTasksByMember,
  verifyTask,
  getAllTaskDefault,
};
