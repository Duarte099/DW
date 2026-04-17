const bodyParser = require("body-parser");
const express = require("express");
const Users = require("../data/users");
function AuthRouter() {
    let router = express.Router();
    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
    router.route("/register").post(function (req, res, next) {
        const body = req.body;
        console.log("User:", body);
        Users.create(body)
            .then(() => Users.createToken(body))
            .then((response) => {
                res.status(200);
                console.log("User token:", response);
                res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.status(500);
                res.send(err);
            });
    });
    router.route("/me").get(function (req, res, next) {
        let token = req.headers["x-access-token"];
        if (!token) {
            return res
                .status(401)
                .send({ auth: false, message: "No token provided." });
        }
        return Users.verifyToken(token)
            .then((decoded) => {
                console.log(decoded);
                res.status(202).send({ auth: true, decoded });
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });
    router.route("/login").post(function (req, res, next) {
        let body = req.body;
        console.log("Login for user:", body);
        return Users.findUser(body)
            .then((user) => {
                return Users.createToken(user);
            })
            .then((response) => {
                res.status(200);
                res.send(response);
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });
    router.post("/forgot-password", (req, res) => {
        const { email } = req.body;

        Users.forgotPassword(email)
            .then((response) => {
                res.send(response);
            })
            .catch(() => {
                res.send({
                    message: "Token gerado",
                    token: null,
                });
            });
    });
    router.post("/reset-password", (req, res) => {
        const { token, password } = req.body;

        Users.resetPassword(token, password)
            .then(() => {
                res.send({ message: "Password alterada com sucesso" });
            })
            .catch((err) => {
                res.status(400).send({ message: err });
            });
    });
    return router;
}
module.exports = AuthRouter;
