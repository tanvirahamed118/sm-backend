const Prisma = require("../config/db.connect");
const {
  QUERY_SUCCESSFUL_MESSAGE,
  DATA_NOT_FOUND_MESSAGE,
  DELETE_SUCCESSFUL_MESSAGE,
  MESSAGE_ADD_SUCCESSFUL_MESSAGE,
  UPDATE_SUCCESSFUL_MESSAGE,
} = require("../utils/response");
const sendNotificationMail = require("../utils/sendNotificationMail");
const { SUCCESS_STATUS, ERROR_STATUS } = require("../utils/status");

// get all messages
async function getAllMessage(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const messages = await Prisma.message.findMany({
      skip: skip,
      take: limitNumber,
    });
    const totalMessage = await Prisma.message.count();
    const totalPage = Math.ceil(totalMessage / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        messages,
        totalPage,
        totalMessage,
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

// get all messages by ids
async function getAllMessageByTaskid(req, res) {
  const { taskId } = req.query;
  try {
    const findMessages = await Prisma.message.findMany({
      where: {
        taskId: Number(taskId),
      },
      include: {
        sender: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      messages: findMessages,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all messages by ids
async function getAllMessageByReciverid(req, res) {
  const { id } = req.query;
  try {
    const findMessages = await Prisma.message.findMany({
      where: {
        senderId: {
          not: Number(id),
        },
      },
      include: {
        sender: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      messages: findMessages,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get single messages
async function getSingleMessage(req, res) {
  const { id } = req.params;
  try {
    const existmessage = await Prisma.message.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existmessage) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      messages: existmessage,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// create messages
async function createMessage(req, res) {
  const { message, senderId, username, taskId } = req.body;
  try {
    const existTask = await Prisma.task.findUnique({
      where: {
        id: Number(taskId),
      },
      include: {
        assignee: true,
        owner: true,
      },
    });
    if (existTask?.ownerId === senderId) {
      const existUser = await Prisma.user.findUnique({
        where: {
          id: Number(existTask?.assignee?.id),
        },
      });

      await Prisma.notification.create({
        data: {
          userId: Number(existTask?.assignee?.id),
          message: `You have recive a new message: ${message}`,
        },
      });
      await sendNotificationMail(
        existUser?.email,
        existUser?.username,
        `Message: ${message}`,
        "You have recive a new message",
        "You have recive a new message from SMARTPM"
      );
    }
    if (existTask?.assigneeId === senderId) {
      await Prisma.notification.create({
        data: {
          userId: Number(existTask?.owner?.id),
          message: `You have recive a new message: ${message}`,
        },
      });
    }
    const newMessage = await Prisma.message.create({
      data: {
        message,
        senderId,
        username,
        taskId,
      },
    });
    res.status(201).json({
      status: SUCCESS_STATUS,
      message: MESSAGE_ADD_SUCCESSFUL_MESSAGE,
      messages: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// update messages
async function updateMessage(req, res) {
  const { message } = req.body;
  const { id } = req.params;
  try {
    const existMessage = await Prisma.message.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existMessage) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await Prisma.notification.create({
      data: {
        userId: Number(existMessage?.senderId),
        message: `Your message has been updated by admin: ${message}`,
      },
    });
    const updateMessage = await Prisma.message.update({
      where: {
        id: Number(id),
      },
      data: {
        message,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      messages: updateMessage,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// read messages
async function readMessage(req, res) {
  const { id } = req.params;
  try {
    const existMessage = await Prisma.message.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existMessage) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }

    const updateMessage = await Prisma.message.update({
      where: {
        id: Number(id),
      },
      data: {
        read: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      messages: updateMessage,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// delete messages
async function deleteMessage(req, res) {
  const { id } = req.params;
  try {
    const existMessage = await Prisma.message.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existMessage) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await Prisma.notification.create({
      data: {
        userId: Number(existMessage?.senderId),
        message: `Your message has been deleted by admin: ${existMessage?.message}`,
      },
    });
    const deletemessage = await Prisma.message.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      messages: deletemessage,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

module.exports = {
  getAllMessage,
  getSingleMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  getAllMessageByTaskid,
  getAllMessageByReciverid,
  readMessage,
};
