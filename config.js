const config = {
    db: "mongodb://localhost:27017/WorkHub-Spaces",
    secret: "supersecret",
    expiresPassword: 86400,
    saltRounds: 10,
};
module.exports = config;
