const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema({
    inputTodo: {
        type: String,
        required: true,
        minLength : 3,
        maxLength : 100,
        trim: true
    },
    completed: {
        type: Boolean,
        required: false
    },
    username: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('todo_data',todoSchema)