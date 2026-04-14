const Spaces = require('./spaces');
const SpaceService = require('./service');
const service = Spaces(SpaceService);
module.exports = service;