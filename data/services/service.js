function ServiceService(Service) {
    let service = {
        create,
        findAll,
        findById,
        update,
        removeById,
    };

    function create(values) {
        if (!values || typeof values !== "object") {
            return Promise.resolve({
                type: "error",
                message: "Dados inválidos.",
            });
        }

        let newService = new Service(values);
        return save(newService);
    }
    function save(newService) {
        return new Promise(function (resolve) {
            newService
                .save()
                .then(() =>
                    resolve({
                        type: "success",
                        message: "Serviço criado com sucesso.",
                    }),
                )
                .catch(() =>
                    resolve({
                        type: "error",
                        message: "Erro ao criar serviço.",
                    }),
                );
        });
    }
    function findAll(page, size) {
        return new Promise(function (resolve) {
            const pageNum = parseInt(page);
            const sizeNum = parseInt(size);

            if (!pageNum || !sizeNum) {
                Service.find({})
                    .then((services) =>
                        resolve({
                            success: true,
                            message: "Serviços obtidos com sucesso.",
                            data: services,
                            total: services.length,
                            page: null,
                            size: null,
                            totalPages: 1,
                        }),
                    )
                    .catch((err) =>
                        resolve({
                            success: false,
                            message: err.message,
                        }),
                    );
                return;
            }

            const skip = (pageNum - 1) * sizeNum;

            Promise.all([
                Service.find({}).skip(skip).limit(sizeNum),
                Service.countDocuments(),
            ])
                .then(([data, total]) =>
                    resolve({
                        success: true,
                        message: "Serviços obtidos com sucesso.",
                        data,
                        total,
                        page: pageNum,
                        size: sizeNum,
                        totalPages: Math.ceil(total / sizeNum),
                    }),
                )
                .catch((err) =>
                    resolve({
                        success: false,
                        message: err.message,
                    }),
                );
        });
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível obter o serviço.",
                });
            }

            Service.findById(id)
                .then((service) => {
                    if (!service) {
                        return reject({
                            type: "error",
                            message: "Não foi possível obter o serviço.",
                        });
                    }

                    resolve({
                        data: service,
                        type: "success",
                        message: "Serviço obtido com sucesso.",
                    });
                })
                .catch((err) => {
                    console.error("Erro em findById(Service):", err);
                    reject({
                        type: "error",
                        message: "Não foi possível obter o serviço.",
                    });
                });
        });
    }
    function update(id, values) {
        return new Promise(function (resolve, reject) {
            if (!id || !values || typeof values !== "object") {
                return reject({
                    type: "error",
                    message: "Não foi possível atualizar o serviço.",
                });
            }

            Service.findById(id)
                .then((existingService) => {
                    if (!existingService) {
                        return reject({
                            type: "error",
                            message: "Não foi possível atualizar o serviço.",
                        });
                    }

                    return Service.findByIdAndUpdate(id, values, { new: true });
                })
                .then((service) => {
                    if (!service) {
                        return reject({
                            type: "error",
                            message: "Não foi possível atualizar o serviço.",
                        });
                    }

                    resolve({
                        data: service,
                        type: "success",
                        message: "Serviço atualizado com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível atualizar o serviço.",
                    });
                });
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível remover o serviço.",
                });
            }

            Service.findByIdAndDelete(id)
                .then((service) => {
                    if (!service) {
                        return reject({
                            type: "error",
                            message: "Não foi possível remover o serviço.",
                        });
                    }

                    resolve({
                        type: "success",
                        message: "Serviço removido com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível remover o serviço.",
                    });
                });
        });
    }
    return service;
}
module.exports = ServiceService;
