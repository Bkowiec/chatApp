const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const gameScoreSchema = new Schema({
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    carType: {
        type: String
    },
    score: {
        type: Number,
        default: 0
    },
});


module.exports = mongoose.model('GameScore', gameScoreSchema);