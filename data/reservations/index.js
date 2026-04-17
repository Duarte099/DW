const ReservationModel = require('./reservation');
const ReservationService = require('./service');

const service = ReservationService(ReservationModel);

module.exports = service;