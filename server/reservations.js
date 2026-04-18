const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
const Reservations = require("../data/reservations");
const authMiddleware = require("../middlewares/authorize");
function ReservationRouter() {
    let router = express.Router();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.use(authMiddleware);
    router
        .route("/")
        .get(
            Users.authorize([
                scopes["read-own-reservations"],
                scopes["manage-reservations"],
            ]),
            function (req, res, next) {
                let page = req.query.page;
                let size = req.query.size;
                if (req.roleUser.includes(scopes["manage-reservations"])) {
                    return Reservations.findAll(page, size)
                        .then((reservations) => res.send(reservations))
                        .catch(next);
                }
                return Reservations.findByUser(req.userId, page, size)
                    .then((reservations) => res.send(reservations))
                    .catch(next);
            },
        )
        .post(
            Users.authorize([
                scopes["manage-reservations"],
                scopes["create-reservations"],
            ]),
            function (req, res, next) {
                let body = req.body;

                const isAdmin = req.roleUser.includes(
                    scopes["manage-reservations"],
                );
                const isClient = req.roleUser.includes(
                    scopes["create-reservations"],
                );

                if (
                    isClient &&
                    !isAdmin &&
                    body.user.toString() !== req.userId
                ) {
                    return res.status(403).json({
                        type: "error",
                        message: "Erro ao criar reserva.",
                    });
                }

                Reservations.create(body)
                    .then((reservation) => {
                        res.status(200).json({
                            type: "success",
                            message: "Reserva criada com sucesso.",
                            data: reservation,
                        });
                    })
                    .catch((err) => {
                        console.error(err);

                        res.status(500).json({
                            type: "error",
                            message: "Erro ao criar reserva.",
                        });
                    });
            },
        );
    router
        .route("/:reservationId")
        .get(
            Users.authorize([
                scopes["read-own-reservations"],
                scopes["manage-reservations"],
            ]),
            function (req, res, next) {
                let reservationId = req.params.reservationId;

                Reservations.findById(reservationId)
                    .then((response) => {
                        const reservation = response.data || response;

                        if (
                            req.roleUser.includes(
                                scopes["manage-reservations"],
                            ) ||
                            reservation.user.toString() === req.userId
                        ) {
                            return res.send(response);
                        }

                        return res.status(403).send({
                            type: "error",
                            message: "Acesso negado.",
                        });
                    })
                    .catch((err) => {
                        res.status(404).send(err);
                    });
            },
        )
        .put(
            Users.authorize([scopes["manage-reservations"]]),
            function (req, res, next) {
                let reservationId = req.params.reservationId;
                let body = req.body;
                Reservations.update(reservationId, body)
                    .then((reservation) => {
                        res.status(200);
                        res.send(reservation);
                        next();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(404);
                        next();
                    });
            },
        )
        .delete(
            Users.authorize([scopes["manage-reservations"]]),
            function (req, res, next) {
                let reservationId = req.params.reservationId;
                Reservations.removeById(reservationId)
                    .then((reservation) => {
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
module.exports = ReservationRouter;
