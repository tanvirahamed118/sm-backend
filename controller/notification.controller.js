const Prisma = require("../config/db.connect");
const {
  QUERY_SUCCESSFUL_MESSAGE,
  DATA_NOT_FOUND_MESSAGE,
  DELETE_SUCCESSFUL_MESSAGE,
  MESSAGE_ADD_SUCCESSFUL_MESSAGE,
  UPDATE_SUCCESSFUL_MESSAGE,
  NOTIFICATION_ADD_SUCCESSFUL_MESSAGE,
} = require("../utils/response");
const { SUCCESS_STATUS, ERROR_STATUS } = require("../utils/status");

// get all notifications
async function getAllNotification(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const notifications = await Prisma.notification.findMany({
      skip: skip,
      take: limitNumber,
    });
    const totalNotification = await Prisma.notification.count();
    const totalPage = Math.ceil(totalNotification / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        notifications,
        totalPage,
        totalNotification,
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

// get all notifications
async function getAllNotificationByUserid(req, res) {
  const { userId } = req.query;
  try {
    const notifications = await Prisma.notification.findMany({
      where: {
        userId: Number(userId),
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      notifications: notifications,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get single notifications
async function getSingleNotification(req, res) {
  const { id } = req.params;
  try {
    const existNotification = await Prisma.notification.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existNotification) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      notifications: existNotification,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// create notifications
async function createNotification(req, res) {
  const { message, userId, read } = req.body;
  try {
    const newNotification = await Prisma.notification.create({
      data: {
        message,
        userId,
        read,
      },
    });
    res.status(201).json({
      status: SUCCESS_STATUS,
      message: NOTIFICATION_ADD_SUCCESSFUL_MESSAGE,
      notifications: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// update notifications
async function updateNotificationStatus(req, res) {
  const { id } = req.params;
  try {
    const existNotification = await Prisma.notification.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existNotification) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateNotification = await Prisma.notification.update({
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
      notifications: updateNotification,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// update notifications
async function updateNotification(req, res) {
  const { message } = req.body;
  const { id } = req.params;
  try {
    const existNotification = await Prisma.notification.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existNotification) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateNotification = await Prisma.notification.update({
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
      notifications: updateNotification,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// delete notifications
async function deleteNotification(req, res) {
  const { id } = req.params;
  try {
    const existNotification = await Prisma.notification.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existNotification) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const deleteNotification = await Prisma.notification.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      notifications: deleteNotification,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

module.exports = {
  getAllNotification,
  getSingleNotification,
  createNotification,
  updateNotificationStatus,
  updateNotification,
  deleteNotification,
  getAllNotificationByUserid,
};
