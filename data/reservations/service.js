function ReservationService(Reservation) {
    let service = {
        create,
        findAll,
        findById,
        findByUser,
        update,
        removeById,
    };

    function create(values) {
        if (!values || typeof values !== "object") {
            return Promise.reject({
                type: "error",
                message: "Não foi possível criar a reserva.",
            });
        }

        if (
            !values.dateTime ||
            !values.space ||
            !values.user ||
            !values.duration
        ) {
            return Promise.reject({
                type: "error",
                message: "Não foi possível criar a reserva.",
            });
        }

        if (isDateInPast(values.dateTime)) {
            return Promise.reject({
                type: "error",
                message: "Data de reserva inválida.",
            });
        }

        return hasConflict(values)
            .then((conflict) => {
                if (conflict) {
                    return Promise.reject({
                        type: "error",
                        message: "Já existe uma reserva neste horário.",
                    });
                }

                let newReservation = new Reservation(values);
                return save(newReservation);
            })
            .catch((err) => {
                return Promise.reject({
                    type: "error",
                    message: "Não foi possível criar a reserva.",
                });
            });
    }
    function save(newReservation) {
        return new Promise(function (resolve, reject) {
            if (!newReservation) {
                return reject({
                    type: "error",
                    message: "Não foi possível criar a reserva.",
                });
            }

            newReservation
                .save()
                .then(() =>
                    resolve({
                        type: "success",
                        message: "Reserva criada com sucesso.",
                    }),
                )
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível criar a reserva.",
                    });
                });
        });
    }
    function findAll(page, size) {
        const pageNum = parseInt(page);
        const sizeNum = parseInt(size);

        if (!pageNum || !sizeNum) {
            return Reservation.find({})
                .populate("user")
                .populate("space")
                .then((data) => ({
                    data,
                    total: data.length,
                    page: null,
                    size: null,
                    totalPages: 1,
                    type: "success",
                    message: "Reservas obtidas com sucesso.",
                }))
                .catch((err) => {
                    return Promise.reject({
                        type: "error",
                        message: "Não foi possível obter as reservas.",
                    });
                });
        }

        const skip = (pageNum - 1) * sizeNum;

        return Promise.all([
            Reservation.find({})
                .skip(skip)
                .limit(sizeNum)
                .populate("user")
                .populate("space"),

            Reservation.countDocuments(),
        ])
            .then(([data, total]) => ({
                data,
                total,
                page: pageNum,
                size: sizeNum,
                totalPages: Math.ceil(total / sizeNum),
                type: "success",
                message: "Reservas obtidas com sucesso.",
            }))
            .catch((err) => {
                return Promise.reject({
                    type: "error",
                    message: "Não foi possível obter as reservas.",
                });
            });
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível obter a reserva.",
                });
            }

            Reservation.findById(id)
                .then((reservation) => {
                    if (!reservation) {
                        return reject({
                            type: "error",
                            message: "Reserva não encontrada.",
                        });
                    }

                    resolve({
                        data: reservation,
                        type: "success",
                        message: "Reserva obtida com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível obter a reserva.",
                    });
                });
        });
    }
    function findByUser(userId) {
        return new Promise(function (resolve, reject) {
            if (!userId) {
                return reject({
                    type: "error",
                    message:
                        "Não foi possível obter as reservas do utilizador.",
                });
            }

            Reservation.find({ user: userId })
                .then((reservations) => {
                    resolve({
                        data: reservations,
                        type: "success",
                        message: "Reservas do utilizador obtidas com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message:
                            "Não foi possível obter as reservas do utilizador.",
                    });
                });
        });
    }
    function update(id, values) {
        if (!id || !values || typeof values !== "object") {
            return Promise.reject({
                type: "error",
                message: "Não foi possível atualizar a reserva.",
            });
        }

        return Reservation.findById(id)
            .then((existing) => {
                if (!existing) {
                    return Promise.reject({
                        type: "error",
                        message: "Reserva não encontrada.",
                    });
                }

                const updatedValues = {
                    dateTime: values.dateTime || existing.dateTime,
                    duration: values.duration || existing.duration,
                    space: values.space || existing.space,
                    status: values.status || existing.status,
                    user: existing.user,
                };

                if (isDateInPast(updatedValues.dateTime)) {
                    return Promise.reject({
                        type: "error",
                        message: "Data de reserva inválida.",
                    });
                }

                return hasConflict(updatedValues, id).then((conflict) => {
                    if (conflict) {
                        return Promise.reject({
                            type: "error",
                            message: "Já existe uma reserva neste horário.",
                        });
                    }

                    return Reservation.findByIdAndUpdate(id, values, {
                        new: true,
                    }).then((reservation) => ({
                        data: reservation,
                        type: "success",
                        message: "Reserva atualizada com sucesso.",
                    }));
                });
            })
            .catch((err) => {
                return Promise.reject({
                    type: "error",
                    message: "Não foi possível atualizar a reserva.",
                });
            });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível remover a reserva.",
                });
            }

            Reservation.findByIdAndDelete(id)
                .then((reservation) => {
                    if (!reservation) {
                        return reject({
                            type: "error",
                            message: "Reserva não encontrada.",
                        });
                    }

                    resolve({
                        type: "success",
                        message: "Reserva removida com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível remover a reserva.",
                    });
                });
        });
    }
    //Funções Auxiliares
    function isDateInPast(dateTime) {
        return new Date(dateTime) < new Date();
    }
    function getDateTime(datetime) {
        return new Date(datetime);
    }
    function getEndTime(startDateTime, duration) {
        const end = new Date(startDateTime);
        end.setHours(end.getHours() + duration);
        return end;
    }
    function hasConflict(values, ignoreId = null) {
        const start = getDateTime(values.dateTime);
        const end = getEndTime(start, values.duration);

        return Reservation.find({
            space: values.space,
            status: { $in: ["pending", "confirmed"] },
        }).then((reservations) => {
            for (let r of reservations) {
                //Ignora a propria reserva
                if (ignoreId && r._id.toString() === ignoreId.toString()) {
                    continue;
                }

                const existingStart = getDateTime(r.dateTime);
                const existingEnd = getEndTime(existingStart, r.duration);
                // Se a reserva começar antes da outra acabar e a reserva acaba depois da outra começar
                if (start < existingEnd && end > existingStart) {
                    return true;
                }
            }

            return false;
        });
    }
    return service;
}
module.exports = ReservationService;
