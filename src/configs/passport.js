const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { email: profile.emails[0].value },
        });
        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            full_name: profile.displayName,
            profile_image: profile.photos[0].value,
            role: "candidate",
          });
        }
        // console.log("Đăng nhập thành công: ", user);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user (Lưu user vào session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (Lấy user từ session)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
