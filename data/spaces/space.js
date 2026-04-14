var mongoose = require('mongoose');
let Schema = mongoose.Schema;
var SpaceSchema = new Schema({
    name: { type: String, require: true, unique: true},
    description: { type: String, require: true},
    capacity: { type: String, require: true},
    equipment: { type: Number, require: true },
    price: { type: Number, require: true },
    img: { type: String, require: false },
    active:{ type: Boolean, require: true, default: true }
});
let Space = mongoose.model('Space', SpaceSchema);
module.exports = Space;