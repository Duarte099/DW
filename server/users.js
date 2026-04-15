const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
function UserRouter() {
    let router = express.Router();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.use(function (req, res, next) {
        let token = req.headers["x-access-token"];
        if (!token) {
            return res
                .status(400)
                .send({ auth: false, message: "No token provided." });
        }
        Users.verifyToken(token)
            .then((decoded) => {
                console.log(" -= > Valid Token <=- ");
                console.log("DECODED->" + JSON.stringify(decoded, null, 2));
                req.roleUser = decoded.role;
                next();
            })
            .catch(() => {
                res.status(401).send({
                    auth: false,
                    message: "Not authorized",
                });
            });
    });
    router
        .route("/")
        .get(
            Users.authorize([scopes["manage-users"]]),
            function (req, res, next) {
                Users.findAll()
                    .then((users) => {
                        res.send(users);
                        next();
                    })
                    .catch((err) => {
                        next();
                    });
            },
        )
        .post(
            Users.authorize([scopes["manage-users"]]),
            function (req, res, next) {
                let body = req.body;
                Users.create(body)
                    .then(() => {
                        res.status(200);
                        res.send(body);
                    })
                    .catch((err) => {
                        res.status(500);
                        res.send(err);
                    });
            },
        );
    router
        .route("/:userId")
        .get(
            Users.authorize([scopes["manage-users"]]),
            function (req, res, next) {
                let userId = req.params.userId;
                Users.findById(userId)
                    .then((user) => {
                        res.status(200);
                        res.send(user);
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        )
        .put(
            Users.authorize([scopes["manage-users"]]),
            function (req, res, next) {
                let userId = req.params.userId;
                let body = req.body;
                Users.update(userId, body)
                    .then((user) => {
                        res.status(200);
                        res.send(user);
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        )
        .delete(
            Users.authorize([scopes["manage-users"]]),
            function (req, res, next) {
                let userId = req.params.userId;
                Users.removeById(userId)
                    .then((user) => {
                        res.status(200);
                        res.send();
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        );
    return router;
}
module.exports = UserRouter;
