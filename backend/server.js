require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:4200'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Trop de requêtes, réessayez plus tard.",
  })
);


app.use("/api/auth", require("./routes/auth"));
app.use("/api/articles", require("./routes/article"));
app.use("/api/comments", require("./routes/comment")(io));
app.use("/api/users", require("./routes/user"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
    const Role = require("./models/Role");
    const roles = ["admin", "user"];
    for (const roleName of roles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName, permissions: [] });
      }
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running");
});

io.on("connection", (socket) => {
  socket.on("joinArticle", (articleId) => {
    socket.join(articleId);
  });
  socket.on("leaveArticle", (articleId) => {
    socket.leave(articleId);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
