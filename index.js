const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const path = require("path");
const createAdmin = require("./utils/createAdmin");
const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/team");
const { isMember } = require("./middlewares/auth");
const expressEjsLayouts = require("express-ejs-layouts");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body",
    });
  }
  next(err);
});

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_KEY = process.env.SESSION_KEY;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Create session store
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

// Catch errors from session store
store.on("error", (error) => {
  console.error("Session store error:", error);
});

// Session middleware
app.use(
  session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: false, //  set to true if using HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
createAdmin();

// Set EJS as the view engine
app.use(expressEjsLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "./layouts/old");
// Routes

app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.use(isMember);
app.use("/view", require("./routes/view"));

// 404 handler
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
