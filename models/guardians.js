// Load required packeges
const mongoose = require('mongoose');

// Create guardians schema
const GuardianSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    minlength: [5, 'Min length is 5 character'],
    maxlength: [50, 'Max length is 50 character']
  },
  email: {
    type: String,
    required: [true, 'Please add an emial'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  picture: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      `invalid url.`
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: [true, 'The phone number is already taken, Please choose another'],
    match: [/^\d{10}$/, 'Phone number maxlength is 10 characters']
  },
  countryCode: {
    type: String,
    required: [true, 'Please select country code'],
  },
  address: {
      type: String,
      required: [true, 'Please enter address']
  },
  bankingInfo: [
    {
      cardNumber: {
        type: String,
        match: [/^\d{16}$/, 'Invalid card number'],
        required: [true, 'Please add a card number']
      },
      expireDate: {
        type: Date,
        required: [true, 'Please add a expire']
      },
      CVV: {
        type: String,
        match: [/^\d{16}$/, 'Invalid CVV number'],
        required: [true, 'Please add a CVV']
      },
      nameOnCard: {
        type: String,
        minlength: [10, 'Min length is 10 character'],
        maxlength: [50, 'Max length is 50 character'],
        required: [true, 'Please add a name on card']
      },
      phoneNumber: {
      type: String,
      required: [true, 'Please add a phone number'],
      unique: [true, 'The phone number is already taken, Please choose another'],
      match: [/^\d{10}$/, 'Phone number maxlength is 10 characters']
      },
      _id: false
    }
  ],
  varificationToken: String,
  varificationTokenExpire: {
    type: Date
  },
  childrenId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'children'
    }
  ]
});

module.exports = mongoose.model('Guardian', GuardianSchema);