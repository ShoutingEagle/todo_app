const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sessionSchema = new Schema({
    _Id: {
        type: String,
    }
},{strict: false})

module.exports = mongoose.model('todo_session',sessionSchema)