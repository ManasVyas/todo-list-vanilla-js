const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");

const genPassword = (password) => {
  const salt = crypto.randomBytes(32).toString("hex");
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return {
    salt,
    hash: genHash,
  };
};

const validatePassword = (password, hash, salt) => {
  let hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
};

const issueJWT = (user) => {
  const id = user.userId;
  const expiresIn = "1d";
  const payload = {
    sub: id,
    iat: Date.now(),
  };
  const signedToken = jsonwebtoken.sign(payload, process.env.jwtSecret, {
    expiresIn,
    algorithm: "HS256",
  });
  return {
    token: `Bearer ${signedToken}`,
    expiresIn
  };
};

const passportUtils = {
  validatePassword,
  genPassword,
  issueJWT,
};

module.exports = passportUtils;
