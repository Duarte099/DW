const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
const Services = require("../data/services");
const authMiddleware = require("../middlewares/authorize");
function ServiceRouter() {
    let router = express.Router();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.use(authMiddleware);
    router
        .route("/")
        .get(
            Users.authorize([
                scopes["read-services"],
                scopes["manage-services"],
            ]),
            function (req, res, next) {
                Services.findAll()
                    .then((services) => {
                        res.send(services);
                        next();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
        )
        .post(
            Users.authorize([scopes["manage-services"]]),
            function (req, res, next) {
                let body = req.body;
                Services.create(body)
                    .then(() => {
                        res.status(200);
                        res.send(body);
                        next();
                    })
                    .catch((err) => {
                        console.log("Service already exists!");
                        err.status = err.status || 500;
                        res.status(401);
                        next();
                    });
            },
        );
    router
        .route("/:serviceId")
        .get(
            Users.authorize([
                scopes["read-services"],
                scopes["manage-services"],
            ]),
            function (req, res, next) {
                let serviceId = req.params.serviceId;
                Services.findById(serviceId)
                    .then((service) => {
                        res.status(200);
                        res.send(service);
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        )
        .put(
            Users.authorize([scopes["manage-services"]]),
            function (req, res, next) {
                let serviceId = req.params.serviceId;
                let body = req.body;
                Services.update(serviceId, body)
                    .then((service) => {
                        res.status(200);
                        res.send(service);
                        next();
                    })
                    .catch((err) => {
                        res.status(404);
                        next();
                    });
            },
        )
        .delete(
            Users.authorize([scopes["manage-services"]]),
            function (req, res, next) {
                let serviceId = req.params.serviceId;
                Services.removeById(serviceId)
                    .then((service) => {
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
module.exports = ServiceRouter;
