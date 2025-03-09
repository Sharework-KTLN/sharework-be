const express = require("express");
const dotenv = require("dotenv");
const { connectDB, sequelize } = require("./src/configs/database");
// import middleware
const corsMiddleware = require("./src/middlewares/corsMiddleware");
const sessionMiddleware = require("./src/middlewares/sessionMiddleware");
const passportMiddleware = require("./src/middlewares/passportMiddleware");
// import tất cả route
const routes = require("./src/routes");

dotenv.config();
const app = express();
const PORT = 8080;

const Application = require("./src/models/Application");
const Company = require("./src/models/Company");
const Job = require("./src/models/Job");
const Resume = require("./src/models/Resume");
const Review = require("./src/models/Review");
const SaveJob = require("./src/models/SaveJob");
const User = require("./src/models/User");

// middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);
passportMiddleware(app);
// routé
app.use("/", routes);

// mapping database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Data base sync successfully");
  } catch (err) {
    console.log("Data base sync failed: ", err);
  }
};

app.get("/", (req, res) => {
  res.send("Hello World !");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB();
// syncDatabase();
