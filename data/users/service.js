const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../../config");

function UserService(UserModel) {
    let service = {
        create,
        createToken,
        verifyToken,
        findUser,
        authorize,
    };
    function authorize(scopes) {
        return (request, response, next) => {
            const { roleUser } = request; // the decoded roles from verifyToken
            console.log("route scopes:", scopes);
            console.log("user scopes:", roleUser);
            const hasAuthorization = scopes.some((scope) =>
                roleUser.includes(scope),
            );
            if (roleUser && hasAuthorization) {
                next();
            } else {
                response.status(403).json({ message: "Forbidden" }); // Access denied
            }
        };
    }
    // Returns the password hash
    function createPassword(user) {
        return bcrypt.hash(user.password, config.saltRounds);
    }

    // Verifies if the password matches the hash
    function comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    function createToken(user) {
        let token = jwt.sign(
            { id: user._id, name: user.nome, role: user.role.scopes },
            config.secret,
            {
                expiresIn: config.expiresPassword,
            },
        );
        return { auth: true, token };
    }
    function verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    reject();
                }
                return resolve(decoded);
            });
        });
    }
    function findUser({ name, password }) {
        return new Promise(function (resolve, reject) {
            UserModel.findOne({ name })
                .then((user) => {
                    if (!user) {
                        return reject("User not found");
                    }
                    return comparePassword(password, user.password).then(
                        (match) => {
                            if (!match) {
                                return reject("User not valid");
                            }
                            return resolve(user);
                        },
                    );
                })
                .catch((err) => {
                    reject(`There is a problem with login ${err}`);
                });
        });
    }
    function create(user) {
        return createPassword(user).then((passwordHash, err) => {
            if (err) {
                return Promise.reject("Not saved");
            }
            let newUserWithPassword = {
                ...user,
                password: passwordHash,
            };
            let newUser = UserModel(newUserWithPassword);
            return save(newUser);
        });
    }
    function save(model) {
        return new Promise(function (resolve, reject) {
            model
                .save()
                .then(() => resolve(model))
                .catch((err) =>
                    reject(`There is a problem with register ${err}`),
                );
        });
    }
    return service;
}

module.exports = UserService;
