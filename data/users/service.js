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
            const { roleUser } = request;

            if (!roleUser || !Array.isArray(roleUser)) {
                return response.status(403).json({
                    type: "error",
                    message: "Acesso negado.",
                });
            }

            const hasAuthorization = scopes.some((scope) =>
                roleUser.includes(scope),
            );

            if (hasAuthorization) {
                next();
            } else {
                response.status(403).json({
                    type: "error",
                    message: "Acesso negado.",
                });
            }
        };
    }

    function createPassword(user) {
        if (!user || !user.password) {
            return Promise.reject({
                type: "error",
                message: "Não foi possível processar a password.",
            });
        }

        return bcrypt.hash(user.password, config.saltRounds);
    }

    function comparePassword(password, hash) {
        if (!password || !hash) {
            return Promise.resolve(false);
        }

        return bcrypt.compare(password, hash);
    }

    function createToken(user) {
        if (
            !user ||
            !user._id ||
            !user.nome ||
            !user.role ||
            !user.role.scopes
        ) {
            return {
                type: "error",
                message: "Não foi possível criar o token.",
            };
        }

        let token = jwt.sign(
            { id: user._id, name: user.nome, role: user.role.scopes },
            config.secret,
            {
                expiresIn: config.expiresPassword,
            },
        );

        return {
            auth: true,
            token,
            type: "success",
            message: "Login efetuado com sucesso.",
        };
    }

    function verifyToken(token) {
        return new Promise((resolve, reject) => {
            if (!token) {
                return reject({
                    type: "error",
                    message: "Token inválido.",
                });
            }

            jwt.verify(token, config.secret, async (err, decoded) => {
                if (err) {
                    return reject({
                        type: "error",
                        message: "Token inválido.",
                    });
                }

                try {
                    const user = await UserModel.findById(decoded.id);

                    if (!user) {
                        return reject({
                            type: "error",
                            message: "Token inválido.",
                        });
                    }

                    resolve({
                        data: decoded,
                        type: "success",
                        message: "Token válido.",
                    });
                } catch (error) {
                    reject({
                        type: "error",
                        message: "Token inválido.",
                    });
                }
            });
        });
    }

    function findUser({ email, password }) {
        return new Promise(function (resolve, reject) {
            if (!email || !password) {
                return reject({
                    type: "error",
                    message: "Credenciais inválidas.",
                });
            }

            UserModel.findOne({ email })
                .then((user) => {
                    if (!user) {
                        return reject({
                            type: "error",
                            message: "Credenciais inválidas.",
                        });
                    }

                    return comparePassword(password, user.password).then(
                        (match) => {
                            if (!match) {
                                return reject({
                                    type: "error",
                                    message: "Credenciais inválidas.",
                                });
                            }

                            return resolve({
                                data: user,
                                type: "success",
                                message: "Utilizador autenticado com sucesso.",
                            });
                        },
                    );
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível autenticar o utilizador.",
                    });
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
                            type: "success",
                            message: "Utilizadores obtidos com sucesso.",
                        }),
                    )
                    .catch((err) => {
                        reject({
                            type: "error",
                            message: "Não foi possível obter os utilizadores.",
                        });
                    });
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
                        type: "success",
                        message: "Utilizadores obtidos com sucesso.",
                    }),
                )
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível obter os utilizadores.",
                    });
                });
        });
    }

    function create(user) {
        if (!user || typeof user !== "object") {
            return Promise.reject({
                type: "error",
                message: "Não foi possível criar o utilizador.",
            });
        }

        return createPassword(user)
            .then((passwordHash) => {
                let newUserWithPassword = {
                    ...user,
                    password: passwordHash,
                };
                let newUser = UserModel(newUserWithPassword);
                return save(newUser);
            })
            .catch((err) => {
                return Promise.reject({
                    type: "error",
                    message: "Não foi possível criar o utilizador.",
                    error: err.message || err.error,
                });
            });
    }

    function findById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível obter o utilizador.",
                });
            }

            UserModel.findById(id)
                .then((user) => {
                    if (!user) {
                        return reject({
                            type: "error",
                            message: "Utilizador não encontrado.",
                        });
                    }

                    resolve({
                        data: user,
                        type: "success",
                        message: "Utilizador obtido com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível obter o utilizador.",
                    });
                });
        });
    }

    function update(id, values) {
        return new Promise(function (resolve, reject) {
            if (!id || !values || typeof values !== "object") {
                return reject({
                    type: "error",
                    message: "Não foi possível atualizar o utilizador.",
                });
            }

            UserModel.findById(id)
                .then((existingUser) => {
                    if (!existingUser) {
                        return reject({
                            type: "error",
                            message: "Utilizador não encontrado.",
                        });
                    }

                    return UserModel.findByIdAndUpdate(id, values, {
                        returnDocument: "after",
                    });
                })
                .then((user) => {
                    if (!user) {
                        return reject({
                            type: "error",
                            message: "Não foi possível atualizar o utilizador.",
                        });
                    }

                    resolve({
                        data: user,
                        type: "success",
                        message: "Utilizador atualizado com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível atualizar o utilizador.",
                    });
                });
        });
    }

    function removeById(id) {
        return new Promise(function (resolve, reject) {
            if (!id) {
                return reject({
                    type: "error",
                    message: "Não foi possível remover o utilizador.",
                });
            }

            UserModel.findByIdAndDelete(id)
                .then((user) => {
                    if (!user) {
                        return reject({
                            type: "error",
                            message: "Utilizador não encontrado.",
                        });
                    }

                    resolve({
                        type: "success",
                        message: "Utilizador removido com sucesso.",
                    });
                })
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível remover o utilizador.",
                    });
                });
        });
    }

    function save(model) {
        return new Promise(function (resolve, reject) {
            if (!model) {
                return reject({
                    type: "error",
                    message: "Não foi possível criar o utilizador.",
                });
            }

            model
                .save()
                .then((savedUser) =>
                    resolve({
                        type: "success",
                        message: "Utilizador criado com sucesso.",
                    }),
                )
                .catch((err) => {
                    reject({
                        type: "error",
                        message: "Não foi possível criar o utilizador.",
                        error: err.message,
                    });
                });
        });
    }

    function forgotPassword(email) {
        if (!email) {
            return Promise.resolve({
                type: "success",
                message: "Token gerado.",
                token: null,
            });
        }

        return UserModel.findOne({ email })
            .then((user) => {
                if (!user) {
                    return {
                        type: "success",
                        message: "Token gerado.",
                        token: null,
                    };
                }

                const token = crypto.randomBytes(32).toString("hex");

                user.resetPasswordToken = token;
                user.resetPasswordExpires =
                    Date.now() + config.expiresTokenResetPassword;

                return user.save().then(() => ({
                    type: "success",
                    message: "Token gerado.",
                    token: token,
                }));
            })
            .catch((err) => {
                return Promise.reject({
                    type: "error",
                    message: "Não foi possível gerar o token.",
                });
            });
    }

    function resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            return Promise.reject({
                type: "error",
                message: "Não foi possível alterar a password.",
            });
        }

        return UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })
            .then((user) => {
                if (!user) {
                    return Promise.reject({
                        type: "error",
                        message: "Token inválido ou expirado.",
                    });
                }

                return createPassword({ password: newPassword }).then(
                    (hash) => {
                        user.password = hash;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        return user.save().then(() => ({
                            type: "success",
                            message: "Password alterada com sucesso.",
                        }));
                    },
                );
            })
            .catch((err) => {
                return Promise.reject({
                    type: "error",
                    message: "Não foi possível alterar a password.",
                });
            });
    }
    return service;
}

module.exports = UserService;
