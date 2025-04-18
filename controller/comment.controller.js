const Prisma = require("../config/db.connect");
const {
  QUERY_SUCCESSFUL_MESSAGE,
  DATA_NOT_FOUND_MESSAGE,
  DELETE_SUCCESSFUL_MESSAGE,
  UPDATE_SUCCESSFUL_MESSAGE,
  COMMENT_ADD_SUCCESSFUL_MESSAGE,
} = require("../utils/response");
const sendNotificationMail = require("../utils/sendNotificationMail");
const { SUCCESS_STATUS, ERROR_STATUS } = require("../utils/status");

// get all messages
async function getAllComment(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const comments = await Prisma.comment.findMany({
      skip: skip,
      take: limitNumber,
    });
    const totalComments = await Prisma.comment.count();
    const totalPage = Math.ceil(totalComments / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        comments,
        totalPage,
        totalComments,
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
async function getAllCommentByTaskid(req, res) {
  const { page = 1, limit = 10, taskId } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const comments = await Prisma.comment.findMany({
      skip: skip,
      take: limitNumber,
      where: {
        taskId: Number(taskId),
      },
      include: {
        creator: true,
      },
    });
    const totalComment = await Prisma.comment.count();
    const totalPage = Math.ceil(totalComment / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        comments,
        totalPage,
        totalComment,
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
async function getAllCommentByassignId(req, res) {
  const { assigneerId } = req.query;
  try {
    const existComments = await Prisma.comment.findMany({
      where: {
        assigneerId: Number(assigneerId),
      },
      include: {
        sender: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      comments: existComments,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all messages by ids
async function getAllCommentByownerId(req, res) {
  const { creatorId } = req.query;
  try {
    const existComments = await Prisma.comment.findMany({
      where: {
        creatorId: Number(creatorId),
      },
      include: {
        sender: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      comments: existComments,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get all messages by ids
async function getAllCommentByProjectId(req, res) {
  const { projectId } = req.query;
  try {
    const existComments = await Prisma.comment.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        sender: true,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      comments: existComments,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// get single messages
async function getSingleComment(req, res) {
  const { id } = req.params;
  try {
    const existComments = await Prisma.comment.findUnique({
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
      comments: existComments,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// create messages
async function createComment(req, res) {
  const { comment, taskId } = req.body;
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
    const existUser = await Prisma.user.findUnique({
      where: {
        id: existTask?.assigneeId,
      },
    });

    if (!existTask) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }

    const newComment = await Prisma.comment.create({
      data: {
        comment,
        creatorId: existTask?.ownerId,
        assigneerId: existTask?.assigneeId,
        taskId: Number(taskId),
        projectId: existTask?.projectId,
      },
    });
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      `Comment: ${comment}`,
      "You have received a new comment",
      "You have received a new comment from SMARTPM"
    );

    await Prisma.notification.create({
      data: {
        userId: Number(existTask?.assigneeId),
        message: `You have received a new comment: ${comment}`,
      },
    });

    res.status(201).json({
      status: SUCCESS_STATUS,
      message: COMMENT_ADD_SUCCESSFUL_MESSAGE,
      comments: newComment,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// create messages
async function updateComment(req, res) {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const existComment = await Prisma.comment.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existComment) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateComment = await Prisma.comment.update({
      where: {
        id: Number(id),
      },
      data: {
        comment,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      comments: updateComment,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// delete messages
async function deleteComment(req, res) {
  const { id } = req.params;
  try {
    const existComment = await Prisma.comment.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existComment) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }

    const deleteComment = await Prisma.comment.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      comments: deleteComment,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

module.exports = {
  getAllComment,
  getAllCommentByProjectId,
  getAllCommentByTaskid,
  getAllCommentByassignId,
  getAllCommentByownerId,
  getSingleComment,
  createComment,
  deleteComment,
  updateComment,
};
