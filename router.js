const express = require("express");
let AuthAPI = require("./server/auth");
function initialize() {
  let api = express();
  api.use("/auth", AuthAPI());
  return api;
}
module.exports = {
  initialize: initialize,
};
