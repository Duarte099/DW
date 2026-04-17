function ServiceService(Service) {
    let service = {
        create,
        findAll,
        findById,
        update,
        removeById,
    };

    function create(values) {
        let newService = new Service(values);
        return save(newService);
    }
    function save(newService) {
        return new Promise(function (resolve, reject) {
            newService
                .save()
                .then(() => resolve("Service created"))
                .catch((err) => reject(err));
        });
    }
    function findAll(page, size) {
        return new Promise(function (resolve, reject) {
            const pageNum = parseInt(page);
            const sizeNum = parseInt(size);

            if (!pageNum || !sizeNum) {
                Service.find({})
                    .then((services) =>
                        resolve({
                            data: services,
                            total: services.length,
                            page: null,
                            size: null,
                            totalPages: 1,
                        }),
                    )
                    .catch((err) => reject(err));
                return;
            }

            const skip = (pageNum - 1) * sizeNum;

            Promise.all([
                Service.find({}).skip(skip).limit(sizeNum),

                Service.countDocuments(),
            ])
                .then(([data, total]) =>
                    resolve({
                        data,
                        total,
                        page: pageNum,
                        size: sizeNum,
                        totalPages: Math.ceil(total / sizeNum),
                    }),
                )
                .catch((err) => reject(err));
        });
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            Service.findById(id)
                .then((service) => resolve(service))
                .catch((err) => reject(err));
        });
    }
    function update(id, values) {
        return new Promise(function (resolve, reject) {
            Service.findByIdAndUpdate(id, values, { new: true })
                .then((service) => resolve(service))
                .catch((err) => reject(err));
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            Service.findByIdAndDelete(id)
                .then(() => resolve("Service removed"))
                .catch((err) => reject(err));
        });
    }
    return service;
}
module.exports = ServiceService;
