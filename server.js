//Environmental Variables
require("dotenv").config();
const PORT = process.env.PORT || 3000;

//Express
const express = require("express");
const app = express();

//http
const http = require("http").Server(app);

//Socket io
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  socket.setMaxListeners(20);
  socket.on("workcycle complete", (msg) => {
    io.emit("workcycle complete", msg);
  });
  socket.on("dept completed", (msg) => {
    io.emit("dept completed", msg);
  });
  io.on("disconnect", () => {
    console.log("a user disconnected");
  });
});

//Web Push
const webPush = require("web-push");
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

webPush.setVapidDetails(
  "mailto: deepanchakravarthi434@gmail.com",
  publicKey,
  privateKey
);

//Sessions
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

let flash = require("connect-flash");

//Passport
const passport = require("passport");
require("./config/passport")(passport);

//MongoDB connection
let mongoose = require("mongoose");
const connectDB = require("./config/db");
connectDB();

//Setting the view engine
app.set("view engine", "ejs");

//Express Middlewares
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "SESSION_SECRET",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/", require("./routes/index"));
app.use("/production-kanban-card", require("./routes/production-kanban-card"));
app.use(
  "/fabric-inspection-board",
  require("./routes/fabric-inspection-board")
);
app.use("/cutting-board", require("./routes/cutting-board"));
app.use("/sewing-board", require("./routes/sewing-board"));
// app.use("/available-products", require("./routes/available-products"));
app.use("/finishing-board", require("./routes/finishing-board"));
app.use("/rework-kanban-card", require("./routes/rework-kanban-card"));
app.use("/analyze", require("./routes/analyze"));
app.use("/edit-card", require("./routes/edit-card"));
app.use("/login", require("./routes/login"));
app.use("/register", require("./routes/register"));
app.use("/logout", require("./routes/logout"));
app.use("/task-limit", require("./routes/task-limit"));
app.use("/subscribe", require("./routes/subscribe"));
app.use("/notification-board", require("./routes/notification-board"));

http.listen(PORT, console.log(`Server running on http://localhost:${PORT}`));
