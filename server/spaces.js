const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
const Spaces = require("../data/spaces");
const authMiddleware = require("../middlewares/authorize");
function getEndTime(startDateTime, duration) {
    const end = new Date(startDateTime);
    end.setHours(end.getHours() + duration);
    return end;
}
function SpaceRouter() {
    let router = express();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.use(authMiddleware);
    router
        .route("/")
        .get(
            Users.authorize([scopes["read-spaces"], scopes["manage-spaces"]]),
            async function (req, res, next) {
                try {
                    let { name, capacity, startDate, endDate } = req.query;

                    let result = await Spaces.findAll();
                    let spaces = result.data || [];
                    
                    console.log("Filtered spaces:", spaces);
                    if (name) {
                        spaces = spaces.filter((s) =>
                            s.name.toLowerCase().includes(name.toLowerCase()),
                        );
                    }

                    if (capacity) {
                        spaces = spaces.filter(
                            (s) => s.capacity >= parseInt(capacity),
                        );
                    }

                    if (startDate && endDate) {
                        let start = new Date(startDate);
                        let end = (spaces = spaces.filter((s) => {
                            if (!s.bookings) return true;

                            return !s.bookings.some((b) => {
                                let bStart = new Date(b.startDate);
                                let bEnd = new Date(b.endDate);

                                return start <= bEnd && end >= bStart;
                            });
                        }));
                    }

                    res.send(spaces);
                    next();
                } catch (err) {
                    next(err);
                }
            },
        )
        .post(
            Users.authorize([scopes["manage-spaces"]]),
            function (req, res, next) {
                let body = req.body;
                Spaces.create(body)
                    .then(() => {
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
            Users.authorize([scopes["read-spaces"], scopes["manage-spaces"]]),
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
