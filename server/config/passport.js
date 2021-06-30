const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const pool = require("./database");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.jwtSecret,
  algorithm: ["HS256"],
};

const strategy = new JwtStrategy(options, async (payload, done) => {
  try {
    const user = await pool.query(
      `SELECT user_id AS userId, username, password, salt, role, profile_picture AS profilePicture, created_on AS createdOn, updated_on AS updatedOn FROM "user" WHERE user_id = $1`,
      [payload.sub]
    );
    if (user.rows.length > 0) done(null, user);
    else done(null, false);
  } catch (error) {
    done(error, null);
  }
});

module.exports = (passport) => {
  passport.use(strategy);
};
