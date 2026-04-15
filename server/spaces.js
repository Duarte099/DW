const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
const Spaces = require("../data/spaces");
function SpaceRouter() {
    let router = express();
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
            Users.authorize([scopes["read-spaces"]]),
            function (req, res, next) {
                Spaces.findAll()
                    .then((spaces) => {
                        res.send(spaces);
                        next();
                    })
                    .catch((err) => {
                        next();
                    });
            },
        )
        .post(
            Users.authorize([scopes["manage-spaces"]]),
            function (req, res, next) {
                let body = req.body;
                Spaces.create(body)
                    .then(() => {
                        console.log("Created!");
                        res.status(200);
                        res.send(body);
                        next();
                    })
                    .catch((err) => {
                        console.log("Space already exists!");
                        err.status = err.status || 500;
                        res.status(401);
                        next();
                    });
            },
        );
    router
        .route("/:spaceId")
        .get(
            Users.authorize([scopes["read-spaces"]]),
            function (req, res, next) {
                let spaceId = req.params.spaceId;
                Spaces.findById(spaceId)
                    .then((space) => {
                        res.status(200);
                        res.send(space);
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        )
        .put(
            Users.authorize([scopes["manage-spaces"]]),
            function (req, res, next) {
                let spaceId = req.params.spaceId;
                let body = req.body;
                Spaces.update(spaceId, body)
                    .then((space) => {
                        res.status(200);
                        res.send(space);
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        )
        .delete(
            Users.authorize([scopes["manage-spaces"]]),
            function (req, res, next) {
                let spaceId = req.params.spaceId;
                Spaces.removeById(spaceId)
                    .then((space) => {
                        res.status(200);
                        res.send();
                    })
                    .catch((err) => {
                        res.status(404);
                        res.send(err);
                    });
            },
        );
    return router;
}
module.exports = SpaceRouter;
