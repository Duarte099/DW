const SpaceModel = require('./space');
const SpaceService = require('./service');

const service = SpaceService(SpaceModel);

module.exports = service;