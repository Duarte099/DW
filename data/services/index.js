const ServiceModel = require('./serviceLogic');
const ServiceService = require('./service');

const service = ServiceService(ServiceModel);

module.exports = service;