// Module requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// chech if array is empty or no
function arrayOfLength(arr) {
    return Array.isArray(arr) && arr.length > 0
}

// add validation message to check if languages property in mentor schema is empty or not
const languagesValidation = [arrayOfLength, 'enter one language']

// add validation message to check if occupation property in mentor schema is empty or not
const occupationValidation = [arrayOfLength, 'please enter at least one occupation']

// Create a schema
const MentorSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Please enter your name'],
        min: [5, 'The username must be at least 5 charater'],
        max: [50, 'The username must be less than 50 characters long']
    },
    email: {
        type: String,
        required: [true, 'please add email'],
        unique: [true, 'this email is already used'],
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'please add a valid email address']
    },
    password: {
        type: String,
        require: [true, 'please add password'],
        min: [96, 'The password must be at least 8 charater']
    },
    phone: {
        type: String,
        required: [true, 'Please enter phone number'],
        match: [/^\d{10}$/, 'Invalide phone number']
    },
    countryCode: {
        type: String,
        required: [true, 'Please select country code'],
    },
    address: {
        type: String,
        required: [true, 'Please enter address']
    },
    gender: {
        type: String,
        required: [true, 'Please enter gender'],
        enum: ['Male', 'Female']
    },
    birthDate: {
        type: Date,
        required: [true, 'enter ur birthday']
    },
    picture: {
        type: String,
        required: [true, 'Please enter picture'],
    },
    occupation: {
        type: [String],
        validate: occupationValidation
    },
    creatingDate: {
        type: Date,
        default: Date.now
    },
    certificates: [String],
    languages: {
        type: [String],
        validate: languagesValidation
    },
    description: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    topReviewsId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'mentors'
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    coursesId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'courses'
    },
    SubscriptionIDs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'subscriptions'
    },
    bankingInfo: {
        type: [{
            cardNumber: {
                type: String,
                required: [true, 'add card number'],
                match: [/^\d{16}$/, 'Invalide phone number']
            }, 
            Expire: {
                type: String,
                required: [true, 'add expire'],
                match: [/^\d{5}$/, 'Invalide phone number']
            }, 
            CVV: {
                type: String,
                required: [true, 'add CVV'],
                match: [/^\d{3}$/, 'Invalide phone number']
            },
            nameOnCard: {
                type: String,
                required: [true, 'add nameOnCard'],
                min: [10, 'min 10 nameOnCard'],
                max: [50, 'max 50 nameOnCard']
            }, 
            phoneNumber: {
                type: String,
                required: [true, 'add PhoneNumber'],
                match: [/^\d{10}$/, 'Invalide phone number']
            } 
        }],
        required: false
    },
    verificationToken: String,
    verificationTokenExpire: Date
});

module.exports = mongoose.model('Mentor', MentorSchema);