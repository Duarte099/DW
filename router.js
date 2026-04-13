const express = require("express");
let PlayerAPI = require("./server/players");
let AuthAPI = require("./server/auth");
function initialize() {
  let api = express();
  api.use("/team", PlayerAPI());
  api.use("/auth", AuthAPI());
  return api;
}
module.exports = {
  initialize: initialize,
};
