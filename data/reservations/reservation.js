var mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ReservationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    space: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, },
    duration: { type: Number, required: true, },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending", },
    clientObservations: { type: String },
    adminObservations: { type: String },
    extraServices: [ { type: Schema.Types.ObjectId, ref: "ExtraService", }, ],
});
let Space = mongoose.model('Reservations', ReservationSchema);
module.exports = Space;