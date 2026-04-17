const config = {
    db: "mongodb://localhost:27017/WorkHub-Spaces",
    secret: "supersecret",
    expiresPassword: 86400,
    saltRounds: 10,
    expiresTokenResetPassword: 3600000,
};
module.exports = config;
