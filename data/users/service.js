const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../../config/config");
const crypto = require("crypto");

function UserService(UserModel) {
    let service = {
        findAll,
        create,
        findById,
        update,
        removeById,
        createToken,
        verifyToken,
        findUser,
        authorize,
        forgotPassword,
        resetPassword,
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
    function findAll(page, size) {
        return new Promise(function (resolve, reject) {
            const pageNum = parseInt(page);
            const sizeNum = parseInt(size);

            if (!pageNum || !sizeNum) {
                UserModel.find({})
                    .then((users) =>
                        resolve({
                            data: users,
                            total: users.length,
                            page: null,
                            size: null,
                            totalPages: 1,
                        }),
                    )
                    .catch((err) => reject(err));
                return;
            }

            const skip = (pageNum - 1) * sizeNum;

            Promise.all([
                UserModel.find({}).skip(skip).limit(sizeNum),

                UserModel.countDocuments(),
            ])
                .then(([data, total]) =>
                    resolve({
                        data,
                        total,
                        page: pageNum,
                        size: sizeNum,
                        totalPages: Math.ceil(total / sizeNum),
                    }),
                )
                .catch((err) => reject(err));
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
    function findById(id) {
        return new Promise(function (resolve, reject) {
            UserModel.findById(id)
                .then((users) => resolve(users))
                .catch((err) => reject(err));
        });
    }
    function update(id, values) {
        return new Promise(function (resolve, reject) {
            UserModel.findByIdAndUpdate(id, values, { new: true })
                .then((user) => resolve(user))
                .catch((err) => reject(err));
        });
    }
    function removeById(id) {
        return new Promise(function (resolve, reject) {
            UserModel.findByIdAndDelete(id)
                .then(() => resolve("User removed"))
                .catch((err) => reject(err));
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
    function forgotPassword(email) {
        return UserModel.findOne({ email }).then((user) => {
            if (!user) {
                return { message: "Token gerado", token: null };
            }

            const token = crypto.randomBytes(32).toString("hex");

            user.resetPasswordToken = token;
            user.resetPasswordExpires =
                Date.now() + config.expiresTokenResetPassword;

            return user.save().then(() => ({
                message: "Token gerado",
                token: token, 
            }));
        });
    }
    function resetPassword(token, newPassword) {
        return UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        }).then((user) => {
            if (!user) {
                return Promise.reject("Token inválido ou expirado");
            }

            return createPassword({ password: newPassword }).then((hash) => {
                user.password = hash;

                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                return user.save();
            });
        });
    }
    return service;
}

module.exports = UserService;
