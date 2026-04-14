function SpaceService(Space) {
    let service = {
        create,
        findAll,
        findById,
        update,
        removeById
    };

    function create(values) {
        let newSpace = new Space(values);
        return save(newSpace);
    }
    function save(newSpace) {
        return new Promise(function (resolve, reject) {
            newSpace.save()
                .then(() => resolve('Space created'))
                .catch((err) => reject(err));
        });
    }
    function findAll() {
        return new Promise(function (resolve, reject) {
            SpaceModel.find({})
                .then((spaces) => resolve(spaces))
                .catch((err) => reject(err));
        });
    }
    function findById(id) {
        return new Promise(function (resolve, reject) {
            SpaceModel.findById(id)
                .then((space) => resolve(space))
                .catch((err) => reject(err));
        });
    }
    function update(id, values) {
        return new Promise(function (resolve, reject) {
            SpaceModel.findByIdAndUpdate(id, values, { new: true })
                .then((space) => resolve(space))
                .catch((err) => reject(err));
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            SpaceModel.findByIdAndRemove(id)
                .then(() => resolve('Space removed'))
                .catch((err) => reject(err));
        });
    }
    return service;
}
module.exports = SpaceService;
