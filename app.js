const express = require("express");
const http = require("http");
let router = require("./router");
const mongoose = require("mongoose");
const config = require("./config/config");

mongoose
    .connect(config.db)
    .then(() => console.log("Conection successful!"))
    .catch((err) => console.error(err));

const hostname = "127.0.0.1";
const port = 3000;
var app = express();
app.use(router.initialize());
const server = http.Server(app);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
