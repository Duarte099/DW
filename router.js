const express = require("express");
let AuthAPI = require("./server/auth");
let SpacesAPI = require("./server/spaces");
function initialize() {
    let api = express();
    api.use("/auth", AuthAPI());
    api.use("/spaces", SpacesAPI());
    return api;
}
module.exports = {
    initialize: initialize,
};
