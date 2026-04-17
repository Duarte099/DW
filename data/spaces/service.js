function SpaceService(Space) {
    let service = {
        create,
        findAll,
        findById,
        update,
        removeById,
    };

    function create(values) {
        let newSpace = new Space(values);
        return save(newSpace);
    }
    function save(newSpace) {
        return new Promise(function (resolve, reject) {
            newSpace
                .save()
                .then(() => resolve("Space created"))
                .catch((err) => reject(err));
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
                        }),
                    )
                    .catch((err) => reject(err));
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
                    }),
                )
                .catch((err) => reject(err));
        });
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            Space.findById(id)
                .then((space) => resolve(space))
                .catch((err) => reject(err));
        });
    }
    function update(id, values) {
        return new Promise(function (resolve, reject) {
            Space.findByIdAndUpdate(id, values, { new: true })
                .then((space) => resolve(space))
                .catch((err) => reject(err));
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            Space.findByIdAndDelete(id)
                .then(() => resolve("Space removed"))
                .catch((err) => reject(err));
        });
    }
    return service;
}
module.exports = SpaceService;
