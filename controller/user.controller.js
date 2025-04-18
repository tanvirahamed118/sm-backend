const {
  QUERY_SUCCESSFUL_MESSAGE,
  DATA_NOT_FOUND_MESSAGE,
  USER_ALREADY_EXIST_MESSAGE,
  REGISTRATION_SUCCESS_MESSAGE,
  PASSWORD_NOT_MATCH_MESSAGE,
  LOGIN_SUCCESS_MESSAGE,
  USER_NOT_VERIFY_MESSAGE,
  UPDATE_SUCCESSFUL_MESSAGE,
  DELETE_SUCCESSFUL_MESSAGE,
  SECRET_KEY_NOT_VALID,
} = require("../utils/response");
const { SUCCESS_STATUS, ERROR_STATUS } = require("../utils/status");
const Prisma = require("../config/db.connect");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendNotificationMail = require("../utils/sendNotificationMail");
const SecretKey = process.env.SECRET_KEY;

// get all user
async function getAllUser(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const user = await Prisma.user.findMany({
      skip: skip,
      take: limitNumber,
    });
    const totalUser = await Prisma.user.count();
    const totalPage = Math.ceil(totalUser / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        user,
        totalPage,
        totalUser,
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

// get all user
async function getAllUserByRole(req, res) {
  const { role } = req.query;
  try {
    const existUser = await Prisma.user.findMany({
      where: {
        role: role,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      user: existUser,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

async function getAllUserByAdmin(req, res) {
  const { page = 1, limit = 10, role } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;
  try {
    const existUser = await Prisma.user.findMany({
      skip: skip,
      take: limitNumber,
      where: {
        role: role,
      },
    });
    const totalUser = await Prisma.user.count({
      where: {
        role: role,
      },
    });
    const totalPage = Math.ceil(totalUser / limitNumber);
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      data: {
        user: existUser,
        totalPage,
        totalUser,
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

// get single user
async function getSingleUser(req, res) {
  const { id } = req.params;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        projects: {
          include: {
            teamMembers: true,
          },
        },
        assigners: true,
        owners: true,
        projectMemberships: {
          include: {
            project: {
              include: {
                tasks: true,
              },
            },
          },
        },
        messages: true,
        notifications: true,
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: QUERY_SUCCESSFUL_MESSAGE,
      user: existUser,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      message: error.message,
    });
  }
}

// register user
async function registerUser(req, res) {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    agreement,
    username,
    secretKey,
  } = req.body;

  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existUser) {
      return res.status(400).json({
        status: ERROR_STATUS,
        message: USER_ALREADY_EXIST_MESSAGE,
      });
    }
    if (role === "ADMIN") {
      if (secretKey.length > 0 && secretKey !== SecretKey) {
        return res.status(400).json({
          status: ERROR_STATUS,
          message: SECRET_KEY_NOT_VALID,
        });
      }
    }

    if (role === "TEAM_MEMBER") {
      await sendNotificationMail(
        email,
        username,
        "Thanks for joining SMARTPM. Please wait for verification. when your account has been verified, you can log in.",
        "Registration successful",
        "You have received a new notification from SMARTPM"
      );
    }

    if (role === "PROJECT_MANAGER") {
      await sendNotificationMail(
        email,
        username,
        "Thanks for joining SMARTPM. Please wait for verification. when your account has been verified, you can log in.",
        "Registration successful",
        "You have received a new notification from SMARTPM"
      );
    }

    bcrypt.hash(password, 10, async function (err, hash) {
      const newUser = await Prisma.user.create({
        data: {
          email: email,
          password: hash,
          username: username,
          role: role,
          firstName: firstName,
          lastName: lastName,
          agreement: agreement,
          secretKey: secretKey,
          verify: secretKey === SecretKey ? true : false,
        },
      });
      const token = jwt.sign(
        { email: newUser.email, id: newUser.id },
        SecretKey
      );
      if (role === "TEAM_MEMBER") {
        await Prisma.notification.create({
          data: {
            userId: newUser?.id,
            message: `Great, you have register as ${role}. Please wait for verification`,
          },
        });
      }
      if (role === "PROJECT_MANAGER") {
        await Prisma.notification.create({
          data: {
            userId: newUser?.id,
            message: `Great, you have register as ${role}. Please wait for verification`,
          },
        });
      }
      res.status(201).json({
        status: SUCCESS_STATUS,
        message: REGISTRATION_SUCCESS_MESSAGE,
        user: newUser,
        token: token,
      });
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR,
      message: error.message,
    });
  }
}

// login user
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const matchPassword = await bcrypt.compare(password, existUser.password);
    const token = jwt.sign(
      { email: existUser.email, id: existUser.id },
      SecretKey
    );
    if (!matchPassword) {
      return res.status(400).json({
        status: ERROR_STATUS,
        message: PASSWORD_NOT_MATCH_MESSAGE,
      });
    }
    if (!existUser.verify) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: USER_NOT_VERIFY_MESSAGE,
      });
    }
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: LOGIN_SUCCESS_MESSAGE,
      user: existUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// change user
async function changePasswordUser(req, res) {
  const { email, password } = req.body;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      "Your have change your password. Please log in to your account to verify it.",
      "Password change successful",
      "You have received a new notification from SMARTPM"
    );
    bcrypt.hash(password, 10, async function (err, hash) {
      const updateUser = await Prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hash,
        },
      });
      await Prisma.notification.create({
        data: {
          userId: existUser?.id,
          message: `You have change your password successful`,
        },
      });
      res.status(200).json({
        status: SUCCESS_STATUS,
        message: UPDATE_SUCCESSFUL_MESSAGE,
        user: updateUser,
      });
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// change user
async function updatePassword(req, res) {
  const { password, id } = req.body;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      "Your password has been updated. Please log in to your account to verify it.",
      "Password update successful",
      "You have received a new notification from SMARTPM"
    );
    bcrypt.hash(password, 10, async function (err, hash) {
      const updateUser = await Prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          password: hash,
        },
      });
      await Prisma.notification.create({
        data: {
          userId: existUser?.id,
          message: `You have update your password successful`,
        },
      });
      res.status(200).json({
        status: SUCCESS_STATUS,
        message: UPDATE_SUCCESSFUL_MESSAGE,
        user: updateUser,
      });
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// verify user
async function verifyUser(req, res) {
  const { id } = req.params;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    const updateUser = await Prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        verify: true,
      },
    });
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      "Congrats, your account has been verified. Now you can log in and use your account.",
      "Verification successful",
      "You have received a new notification from SMARTPM"
    );
    await Prisma.notification.create({
      data: {
        userId: Number(id),
        message: `Your account has been verified`,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      user: updateUser,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// change user
async function updateUser(req, res) {
  const { id } = req.params;
  const { username, phone, firstName, lastName, address, logo, cover } =
    req.body;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: SUCCESS_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      "Your account has been updated. Please log in to your account to verify it.",
      "Account update successful",
      "You have received a new notification from SMARTPM"
    );
    const basePath = `${req.protocol}://${req.get("host")}/public/`;
    let profileLogo = null;
    let profileCover = null;
    if (req.files?.logo?.length > 0) {
      const fileName = req.files?.logo[0].originalname.split(" ").join("-");
      profileLogo = `${basePath}${fileName}`;
    }
    if (req.files?.cover?.length > 0) {
      const fileName = req.files.cover[0].originalname.split(" ").join("-");
      profileCover = `${basePath}${fileName}`;
    }
    const updateUser = await Prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        username,
        firstName,
        lastName,
        phone,
        address,
        logo: profileLogo ? profileLogo : logo,
        cover: profileCover ? profileCover : cover,
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: UPDATE_SUCCESSFUL_MESSAGE,
      user: updateUser,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

// change user
async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const existUser = await Prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existUser) {
      return res.status(404).json({
        status: ERROR_STATUS,
        message: DATA_NOT_FOUND_MESSAGE,
      });
    }
    await sendNotificationMail(
      existUser?.email,
      existUser?.username,
      "Your account has been deleted. Please log in to your account to verify it.",
      "Account delete successful",
      "You have received a new notification from SMARTPM"
    );

    const deleteUser = await Prisma.user.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      status: SUCCESS_STATUS,
      message: DELETE_SUCCESSFUL_MESSAGE,
      user: deleteUser,
    });
  } catch (error) {
    res.status(500).json({
      status: ERROR_STATUS,
      error: error.message,
    });
  }
}

module.exports = {
  getAllUser,
  getSingleUser,
  registerUser,
  loginUser,
  changePasswordUser,
  updateUser,
  deleteUser,
  verifyUser,
  updatePassword,
  getAllUserByRole,
  getAllUserByAdmin,
};
