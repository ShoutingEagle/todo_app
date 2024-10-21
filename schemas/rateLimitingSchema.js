const mongoose = require('mongoose')
const Schema = mongoose.Schema

const rateLimitingModel = new Schema({
    sessionId: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('rateLimitingdata',rateLimitingModel)