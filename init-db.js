const { sequelize } = require("./src/configs/database");

require("./src/models/Application");
require("./src/models/Company");
require("./src/models/Job");
require("./src/models/Resume");
require("./src/models/Review");
require("./src/models/SaveJob");
require("./src/models/User");
require("./src/models/Skill");
require("./src/models/Major");
require("./src/models/UserSkill");
require("./src/models/UserInterestedMajor");
require("./src/models/Message");
require("./src/models/Conversation");

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database sync successfully");
    process.exit(0); // kết thúc script sau khi sync xong
  } catch (err) {
    console.error("❌ Database sync failed:", err);
    process.exit(1);
  }
};

syncDatabase();
