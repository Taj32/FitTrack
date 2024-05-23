const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: {type: String, required: true},
    logs: [
        {
            date: { type: Date, required: true },
            weight: { type: Number },
            reps: { type: Number },
            sets: { type: Number },
            duration: { type: Number }, // for exercises like push-ups or sit-ups
            // any other exercise-specific data
        }
    ]
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;