// Module requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create a children Schema
const childrenSchema = new Schema({
    userName: {
        type: String,
        requierd: [true, 'add username'],
        unique: true,
        min: [5, 'at least 5 charater'],
        max: [50, 'max 50 charater']
    },
    fullName: {
        type: String,
        required: [true, 'add full name'],
        min: [5, 'at least 5 charater'],
        max: [50, 'max 50 charater']
    },
    password: {
        type: String,
        required: [true, 'add password'],
        min: [96, 'at least 8 charater']
    },
    birthDate: {
        type: Date,
        required: [true, 'add ur birthday']
    },
    picture: String,
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