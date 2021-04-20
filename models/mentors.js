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
        minlength: [5, 'The username must be at least 5 charater'],
        maxlength: [50, 'The username must be less than 50 characters long']
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
    },
    phone: {
        type: String,
        required: [true, 'Please enter phone number'],
        match: [/^\d{10}$/, 'Invalid phone number']
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
        enum: ['mr', 'mrs']
    },
    birthDate: {
        type: Date,
        required: [true, 'enter your birthday']
    },
    picture: {
        type: String,
        required: [true, 'Please enter picture'],
        // match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'invalid url']
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
        ref: 'reviews'
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
                match: [/^\d{16}$/, 'Invalid cardNumber']
            }, 
            Expire: {
                type: Date,
                required: [true, 'add expire']
            }, 
            CVV: {
                type: String,
                required: [true, 'add CVV'],
                match: [/^\d{3}$/, 'Invalid CVV']
            },
            nameOnCard: {
                type: String,
                required: [true, 'add nameOnCard'],
                minlength: [10, 'min 10 nameOnCard'],
                maxlength: [50, 'max 50 nameOnCard']
            }, 
            phoneNumber: {
                type: String,
                required: [true, 'add PhoneNumber'],
                match: [/^\d{10}$/, 'Invalid phone number']
            } 
        }],
        required: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    authorizationModify: Date
});

module.exports = mongoose.model('Mentor', MentorSchema);