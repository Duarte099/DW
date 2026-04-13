const express = require("express");
const http = require("http");
const hostname = "127.0.0.1";
const port = 3000;

let router = require("./router");
var app = express();
app.use(router.initialize());

const config = require("./config");
const mongoose = require("mongoose");

async function startServer() {
  try {
    await mongoose.connect(config.db);
    console.log("Connection successful!");

    const server = http.Server(app);
    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
}

startServer();
