const config = {
  db: "mongodb://127.0.0.1/players-test",
  secret: "supersecret",
  expiresPassword: 86400,
  saltRounds: 10,
};
module.exports = config;
