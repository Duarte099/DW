const express = require("express");
let AuthAPI = require("./middlewares/auth");
let SpacesAPI = require("./server/spaces");
let UsersAPI = require("./server/users");
let ReservationsAPI = require("./server/reservations");
let ServicesAPI = require("./server/services");
function initialize() {
    let api = express.Router();
    api.use("/auth", AuthAPI());
    api.use("/spaces", SpacesAPI());
    api.use("/users", UsersAPI());
    api.use("/reservations", ReservationsAPI());
    api.use("/services", ServicesAPI());
    return api;
}
module.exports = {
    initialize: initialize,
};
