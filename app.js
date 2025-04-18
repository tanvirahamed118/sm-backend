const express = require("express");
const cors = require("cors");
const { SUCCESS_STATUS, ERROR_STATUS } = require("./utils/status");
const {
  HOME_ROUTE_RESPONSE,
  ROUTE_NOT_FOUND_MESSAGE,
} = require("./utils/response");
const app = express();
const corsUrl = process.env.CORS_URL;
const errorHandler = require("./middleware/error.handler");
const UserRouter = require("./route/user.route");
const ProjectRouter = require("./route/project.route");
const TaskRouter = require("./route/task.route");
const MessageRouter = require("./route/message.route");
const NotificationRouter = require("./route/notification.route");
const CommentRouter = require("./route/comment.route");
const AIRouter = require("./route/ai.route");

// app middlewares
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (corsUrl) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// all routes
app.use("/api/auth", UserRouter);
app.use("/api/project", ProjectRouter);
app.use("/api/task", TaskRouter);
app.use("/api/message", MessageRouter);
app.use("/api/notification", NotificationRouter);
app.use("/api/comment", CommentRouter);
app.use("/api/ai", AIRouter);

// main route
app.get("/", (req, res) => {
  res.status(200).json({
    status: SUCCESS_STATUS,
    message: HOME_ROUTE_RESPONSE,
  });
});

// error middleware
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({
    status: ERROR_STATUS,
    message: ROUTE_NOT_FOUND_MESSAGE,
  });
});

module.exports = app;
