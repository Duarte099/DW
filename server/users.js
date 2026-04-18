const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
const authMiddleware = require("../middlewares/authorize");
function UserRouter() {
    let router = express.Router();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.use(authMiddleware);
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
                    .then(() => {
                        res.status(200).send();
                    })
                    .catch((err) => {
                        res.status(404).send(err.message);
                    });
            },
        );
    return router;
}
module.exports = UserRouter;
