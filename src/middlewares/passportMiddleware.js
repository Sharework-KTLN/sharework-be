const passport = require("../configs/passport");

const passportMiddleware = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = passportMiddleware;
