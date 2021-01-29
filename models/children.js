// Module requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema
const childrenSchema = new Schema({
    userName: {
        type: String,
        requierd: true,
        unique: true,
        min: 5,
        max: 50
    },
    fullName: {
        type: String,
        required: true,
        min: 5,
        max: 50
    },
    password: {
        type: String,
        required: true,
        min: 96
    },
    birthDate: {
        type: Date,
        required: true
    },
    picture: String,
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female']
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