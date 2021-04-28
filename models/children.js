// Module requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create a children Schema
const childrenSchema = new Schema({
    userName: {
        type: String,
        requierd: [true, 'add username'],
        unique: true,
        minlength: [5, 'at least 5 charater'],
        maxlength: [50, 'max 50 charater']
    },
    fullName: {
        type: String,
        required: [true, 'add full name'],
        minlength: [5, 'at least 5 charater'],
        maxlength: [50, 'max 50 charater']
    },
    password: {
        type: String,
        required: [true, 'add password'],
    },
    birthDate: {
        type: Date,
        required: [true, 'add ur birthday']
    },
    picture: {
        type: String,
        // match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'invalid url']
    },
    gender: {
        type: String,
        required: [true, 'select gender'],
        enum: ['male', 'female']
    },
    guardianId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'guardians'
    },
    Subscriptions: {
        type: [ mongoose.Schema.Types.ObjectId],
        ref: 'subscriptions'
    }
})

module.exports = mongoose.model('Children', childrenSchema);