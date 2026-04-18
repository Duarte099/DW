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
        if (isDateInPast(values.date, values.startTime)) {
            return Promise.reject("Data de reserva inválida.");
        }

        return hasConflict(values).then((conflict) => {
            if (conflict) {
                return Promise.reject("Já existe uma reserva neste horário.");
            }

            let newReservation = new Reservation(values);
            return save(newReservation);
        });
    }
    function findAll(page, size) {
        const pageNum = parseInt(page);
        const sizeNum = parseInt(size);

        //Se nao tiver valores de paginação
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
                }));
        }

        const skip = (pageNum - 1) * sizeNum;

        return Promise.all([
            Reservation.find({})
                .skip(skip)
                .limit(sizeNum)
                .populate("user")
                .populate("space"),

            Reservation.countDocuments(),
        ]).then(([data, total]) => ({
            data,
            total,
            page: pageNum,
            size: sizeNum,
            totalPages: Math.ceil(total / sizeNum),
        }));
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            Reservation.findById(id)
                .then((Reservation) => resolve(Reservation))
                .catch((err) => reject(err));
        });
    }
    function findByUser(userId) {
        return new Promise(function (resolve, reject) {
            Reservation.find({ user: userId })
                .then((Reservations) => resolve(Reservations))
                .catch((err) => reject(err));
        });
    }
    function update(id, values) {
        return Reservation.findById(id).then((existing) => {
            if (!existing) {
                return Promise.reject("Reserva não encontrada.");
            }

            const updatedValues = {
                date: values.date || existing.date,
                startTime: values.startTime || existing.startTime,
                duration: values.duration || existing.duration,
                space: values.space || existing.space,
                status: values.status || existing.status,
                user: existing.user,
            };

            if (isDateInPast(updatedValues.date, updatedValues.startTime)) {
                return Promise.reject("Data de reserva inválida.");
            }

            return hasConflict(updatedValues, id).then((conflict) => {
                if (conflict) {
                    return Promise.reject(
                        "Já existe uma reserva neste horário.",
                    );
                }

                return Reservation.findByIdAndUpdate(id, values, { new: true });
            });
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            Reservation.findByIdAndDelete(id)
                .then(() => resolve("Reservation removed"))
                .catch((err) => reject(err));
        });
    }
    function save(newReservation) {
        return new Promise(function (resolve, reject) {
            newReservation
                .save()
                .then(() => resolve("Reservation created"))
                .catch((err) => reject(err));
        });
    }
    //Funções Auxiliares
    function isDateInPast(date, startTime) {
        const now = new Date();

        const reservationDateTime = new Date(date);
        const [hours, minutes] = startTime.split(":");

        reservationDateTime.setHours(hours, minutes, 0, 0);

        return reservationDateTime < now;
    }
    function getDateTime(date, time) {
        const d = new Date(date);
        const [h, m] = time.split(":");
        d.setHours(h, m, 0, 0);
        return d;
    }
    function getEndTime(startDateTime, duration) {
        const end = new Date(startDateTime);
        end.setHours(end.getHours() + duration);
        return end;
    }
    function hasConflict(values, ignoreId = null) {
        const start = getDateTime(values.date, values.startTime);
        const end = getEndTime(start, values.duration);

        return Reservation.find({
            space: values.space,
            date: values.date,
            status: { $in: ["pending", "confirmed"] },
        }).then((reservations) => {
            for (let r of reservations) {
                //Ignora a propria reserva
                if (ignoreId && r._id.toString() === ignoreId.toString()) {
                    continue;
                }

                const existingStart = getDateTime(r.date, r.startTime);
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
