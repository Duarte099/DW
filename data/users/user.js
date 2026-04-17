let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let scopes = require("./scopes");
let RoleSchema = new Schema({
    name: { type: String, required: true },
    scopes: [
        {
            type: String,
            enum: [
                scopes["read-spaces"],
                scopes["create-reservations"],
                scopes["read-own-reservations"],
                scopes["read-services"],
                scopes["manage-spaces"],
                scopes["manage-services"],
                scopes["manage-users"],
                scopes["manage-reservations"],
            ],
        },
    ],
});
// Create a schema
let UserSchema = new Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contacto: { type: String, required: true },
    morada: { type: String, required: true },
    nif: { type: Number, required: true, unique: true },
    atividade: { type: String, required: false },
    empresa: { type: String, required: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: RoleSchema },
});
// The schema is useless so far, we need to create a model using it
let User = mongoose.model("User", UserSchema);
// Make this available to our users in our Node applications
module.exports = User;
