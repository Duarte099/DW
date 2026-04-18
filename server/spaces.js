const bodyParser = require("body-parser");
const express = require("express");
const scopes = require("../data/users/scopes");
const Users = require("../data/users");
const Spaces = require("../data/spaces");
const Reservation = require("../data/reservations");
const authMiddleware = require("../middlewares/authorize");
function getEndTime(startDateTime, duration) {
    const end = new Date(startDateTime);
    end.setHours(end.getHours() + duration);
    return end;
}
function SpaceRouter() {
    let router = express.Router();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.use(authMiddleware);
    router
        .route("/")
        .get(
            Users.authorize([scopes["read-spaces"], scopes["manage-spaces"]]),
            async function (req, res, next) {
                try {
                    const {
                        name,
                        capacity,
                        startDate,
                        endDate,
                        sortBy = "price",
                        sortOrder = "desc",
                    } = req.query;

                    let result = await Spaces.findAll();
                    let spaces = result.data || [];

                    let reservationsResult = await Reservation.findAll();
                    let reservations = reservationsResult.data || [];
                    reservations = reservations.filter((r) => r.space != null);

                    const reservationsBySpace = {};
                    reservations.forEach((r) => {
                        // r.space é um objeto populado, por isso usa r.space._id
                        const spaceId = r.space._id.toString();
                        if (!reservationsBySpace[spaceId]) {
                            reservationsBySpace[spaceId] = [];
                        }
                        reservationsBySpace[spaceId].push(r);
                    });

                    // Enriquecer cada space com as suas reservas
                    spaces = spaces.map((s) => ({
                        ...(s._doc || s),
                        bookings: reservationsBySpace[s._id?.toString()] || [],
                    }));

                    // FILTRO por nome
                    if (name) {
                        spaces = spaces.filter((s) =>
                            s.name.toLowerCase().includes(name.toLowerCase()),
                        );
                    }

                    // FILTRO por capacidade
                    if (capacity) {
                        spaces = spaces.filter(
                            (s) => s.capacity >= parseInt(capacity),
                        );
                    }

                    // FILTRO por intervalo de datas
                    if (startDate && endDate) {
                        let start = new Date(startDate);
                        let end = new Date(endDate);

                        spaces = spaces.filter((s) => {
                            if (!s.bookings || s.bookings.length === 0)
                                return true;

                            return !s.bookings.some((b) => {
                                let bStart = new Date(b.dateTime);

                                let bEnd = new Date(bStart);
                                bEnd.setHours(bEnd.getHours() + b.duration);

                                // overlap check
                                return start < bEnd && end > bStart;
                            });
                        });
                    }

                    // ORDENAÇÃO
                    const sortConfig = {
                        price: (a, b) => (a.price || 0) - (b.price || 0),
                        capacity: (a, b) =>
                            (a.capacity || 0) - (b.capacity || 0),
                        popularity: (a, b) =>
                            (a.bookings?.length || 0) -
                            (b.bookings?.length || 0),
                        date: (a, b) => {
                            // Última reserva de cada space
                            const lastA = a.bookings?.sort(
                                (x, y) => new Date(y.date) - new Date(x.date),
                            )[0];

                            const lastB = b.bookings?.sort(
                                (x, y) => new Date(y.date) - new Date(x.date),
                            )[0];

                            // Sem reservas vai sempre para o fim
                            if (!lastA && !lastB) return 0;
                            if (!lastA) return 1;
                            if (!lastB) return -1;

                            return (
                                new Date(lastA.date).getTime() -
                                new Date(lastB.date).getTime()
                            );
                        },
                    };

                    const comparator = sortConfig[sortBy] || sortConfig.price;

                    spaces.sort((a, b) => {
                        const result = comparator(a, b);
                        return sortOrder.toLowerCase() === "desc"
                            ? -result
                            : result;
                    });
                    const spacesResponse = spaces.map(
                        ({ bookings, ...space }) => space,
                    );

                    res.send(spacesResponse);
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
