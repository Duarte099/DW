const Users = require("../data/users");

function authMiddleware(req, res, next) {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(400).send({
            auth: false,
            message: "No token provided.",
        });
    }

    Users.verifyToken(token)
        .then((decoded) => {
            req.roleUser = decoded.data.role;
            req.userId = decoded.data.id;
            next();
        })
        .catch(() => {
            res.status(401).send({
                auth: false,
                message: "Not authorized",
            });
        });
}

module.exports = authMiddleware;
