const express = require("express");
let AuthAPI = require("./server/auth");
let SpacesAPI = require("./server/spaces");
let UsersAPI = require("./server/users")
function initialize() {
    let api = express.Router();
    api.use("/auth", AuthAPI());
    api.use("/spaces", SpacesAPI());
    api.use("/users", UsersAPI());
    return api;
}
module.exports = {
    initialize: initialize,
};
