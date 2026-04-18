function SpaceService(Space) {
    let service = {
        create,
        findAll,
        findById,
        update,
        removeById,
    };

    function create(values) {
        if (!values || typeof values !== "object") {
            return Promise.reject({
                type: "error",
                message: "Não foi possível criar o espaço.",
            });
        }

        let newSpace = new Space(values);
        return save(newSpace);
    }
    function save(newSpace) {
        return new Promise(function (resolve, reject) {
            if (!newSpace) {
                return reject({
                    type: "error",
                    message: "Não foi possível criar o espaço.",
                });
            }

            newSpace
                .save()
                .then(() =>
                    resolve({
                        type: "success",
                        message: "Espaço criado com sucesso.",
                    }),
                )
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível criar o espaço.",
                    });
                });
        });
    }
    function findAll(page, size) {
        return new Promise(function (resolve, reject) {
            const pageNum = parseInt(page);
            const sizeNum = parseInt(size);

            if (!pageNum || !sizeNum) {
                Space.find({})
                    .then((spaces) =>
                        resolve({
                            data: spaces,
                            total: spaces.length,
                            page: null,
                            size: null,
                            totalPages: 1,
                            type: "success",
                            message: "Espaços obtidos com sucesso.",
                        }),
                    )
                    .catch((err) => {
                        reject({
                            type: "error",
                            message: "Não foi possível obter os espaços.",
                        });
                    });
                return;
            }

            const skip = (pageNum - 1) * sizeNum;

            Promise.all([
                Space.find({}).skip(skip).limit(sizeNum),
                Space.countDocuments(),
            ])
                .then(([data, total]) =>
                    resolve({
                        data,
                        total,
                        page: pageNum,
                        size: sizeNum,
                        totalPages: Math.ceil(total / sizeNum),
                        type: "success",
                        message: "Espaços obtidos com sucesso.",
                    }),
                )
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível obter os espaços.",
                    });
                });
        });
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível obter o espaço.",
                });
            }

            Space.findById(id)
                .then((space) => {
                    if (!space) {
                        return reject({
                            type: "error",
                            message: "Espaço não encontrado.",
                        });
                    }

                    resolve({
                        data: space,
                        type: "success",
                        message: "Espaço obtido com sucesso.",
                    });
                })
                .catch((err) => {
                    console.error("Erro em findById(Space):", err);
                    reject({
                        type: "error",
                        message: "Não foi possível obter o espaço.",
                    });
                });
        });
    }
    function update(id, values) {
        return new Promise(function (resolve, reject) {
            if (!id || !values || typeof values !== "object") {
                return reject({
                    type: "error",
                    message: "Não foi possível atualizar o espaço.",
                });
            }

            Space.findById(id)
                .then((existingSpace) => {
                    if (!existingSpace) {
                        return reject({
                            type: "error",
                            message: "Espaço não encontrado.",
                        });
                    }

                    return Space.findByIdAndUpdate(id, values, { new: true });
                })
                .then((space) => {
                    if (!space) {
                        return reject({
                            type: "error",
                            message: "Não foi possível atualizar o espaço.",
                        });
                    }

                    resolve({
                        data: space,
                        type: "success",
                        message: "Espaço atualizado com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível atualizar o espaço.",
                    });
                });
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível remover o espaço.",
                });
            }

            Space.findByIdAndDelete(id)
                .then((space) => {
                    if (!space) {
                        return reject({
                            type: "error",
                            message: "Espaço não encontrado.",
                        });
                    }

                    resolve({
                        type: "success",
                        message: "Espaço removido com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível remover o espaço.",
                    });
                });
        });
    }
    return service;
}
module.exports = SpaceService;
