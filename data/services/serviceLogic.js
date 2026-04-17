var mongoose = require("mongoose");
let Schema = mongoose.Schema;
var ServiceSchema = new Schema({
    name: { type: String, require: true, unique: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    disponibility: { type: Boolean, require: true, default: true },
});
let Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
